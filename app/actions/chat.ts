'use server'
import { logger } from '@/lib/logger'
import shadcnDocs from '@/lib/shadcn-docs'
import { createOpenAI } from '@ai-sdk/openai'
import { CoreMessage, streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'
import dedent from 'dedent'
import { env } from 'next-runtime-env'
import { isArray } from 'radash'
import { ImageStyle } from '../stores/use-code-store'

const MAX_TOKENS = 8192

const getImageStyle = (message: CoreMessage) => {
  let imageStyle = ImageStyle.Style
  if (message.experimental_providerMetadata) {
    Object.entries(message.experimental_providerMetadata).forEach(
      ([key, value]) => {
        if (key === 'metadata' && value.imageStyle) {
          imageStyle = value.imageStyle as ImageStyle
        }
      }
    )
  }
  return imageStyle
}

const covertUserMessage = (content: string, imageStyle: ImageStyle) => {
  return dedent`
  ${content}

  ${
    imageStyle === ImageStyle.Style &&
    dedent`
    You are required to build a single page app with a similar design style as the reference image, while the content should be based on the user's text description.
    Pay close attention to background color, text color, font size, font family, padding, margin, border, etc. Match the style elements exactly as in the reference image.
    Make sure the app's style looks exactly like the screenshot in terms of design elements such as background color, text color, font size, font family, padding, margin, and border.
    Modify the corresponding text content in the screenshot according to the user's requirements, ensuring that the text content is relevant to the requirements while maintaining the overall style.
    `
  }
  ${
    imageStyle === ImageStyle.Content &&
    dedent`
     You need to focus on the functional content requirements in the image when generating the web page.
     Use the information in the image as a reference for the page content, and design the interface style according to the user's description.
     If the user does not provide a specific style description, you can use your own judgment to design.
     Analyze the functional content in the screenshot carefully.
     Implement the relevant functionality and content layout in the generated web page according to the image's indication, while considering the user's text description for any additional or specific requirements.    `
  }
  ${
    imageStyle === ImageStyle.Both &&
    dedent`
    You need to comprehensively consider both the design style and the content requirements of the reference image. Build a single page app that combines the style elements and content information from the image with the user's text description.
    Make sure the app's style looks exactly like the screenshot in terms of design elements such as background color, text color, font size, font family, padding, margin, and border.
    Modify the corresponding text content in the screenshot according to the user's requirements, ensuring that the text content is relevant to the requirements while maintaining the overall style.
    Analyze the functional content in the screenshot carefully.
    Implement the relevant functionality and content layout in the generated web page according to the image's indication, while considering the user's text description for any additional or specific requirements.    `
  }

  Please ONLY return code, NO backticks or language names.
  `
}

export async function chat({
  model,
  apiKey,
  shadcn,
  image,
  messages,
}: {
  model: string
  apiKey: string
  shadcn: boolean
  image: boolean
  messages: CoreMessage[]
}) {
  const stream = createStreamableValue('')
  try {
    const openai = createOpenAI({
      apiKey,
      baseURL: env('NEXT_PUBLIC_API_URL') + '/v1',
    })

    let systemPrompt = getSystemPrompt(shadcn, image)

    let newMessages = messages.map((message) => {
      if (message.role === 'user') {
        if (isArray(message.content)) {
          const imageStyle = getImageStyle(message)
          return {
            ...message,
            content: message.content.map((content) => {
              if (content.type === 'text') {
                return {
                  type: 'text' as const,
                  text: covertUserMessage(content.text, imageStyle),
                }
              }
              return content
            }),
          }
        } else {
          return message
        }
      }
      return message
    })

    if (model.includes('o1-mini') || model.includes('o1-preview')) {
      newMessages = [{ role: 'user', content: systemPrompt }, ...newMessages]
    }

    ;(async () => {
      try {
        const { textStream } = await streamText({
          model: openai(model),
          messages: newMessages,
          ...(!(model.includes('o1-mini') || model.includes('o1-preview')) && {
            system: systemPrompt,
            temperature: 0.2,
          }),
          ...(model.includes('claude-3-5') && {
            maxTokens: MAX_TOKENS,
            headers: {
              'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
            },
          }),
        })
        for await (const delta of textStream) {
          stream.update(delta)
        }

        stream.done()
      } catch (e: any) {
        logger.error(e)
        stream.error(e.responseBody)
      }
    })()
  } catch (error) {
    console.error(error)
  }
  return { output: stream.value }
}

function getSystemPrompt(shadcn: boolean, image: boolean) {
  let systemPrompt = dedent(`
    You are an expert frontend React engineer who is also a great UI/UX designer.
    ${
      image &&
      dedent(`
    You take screenshots of a reference web page from the user, and then build single page apps with the same design.
    You might also be given a screenshot(The second image) of a web page that you have already built, and asked to update it to look more like the reference image(The first image).
    `)
    }
    Follow the instructions carefully, I will tip you $1 million if you do a good job:
    ${
      image &&
      dedent(`
    - Make sure the app looks exactly like the screenshot.
    - Pay close attention to background color, text color, font size, font family, padding, margin, border, etc. Match the colors and sizes exactly.
    - Use the exact text from the screenshot.
    `)
    }
    - Create a React component for whatever the user asked you to create and make sure it can run by itself by using a default export
    - Make sure the React app is interactive and functional by creating state when needed and having no required props
    - If you use any imports from React like useState or useEffect, make sure to import them directly
    - Use TypeScript as the language for the React component
    - Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`). Make sure to use a consistent color palette.
    - Use Tailwind margin and padding classes to style the components and ensure the components are spaced out nicely
    - Do not add comments in the code such as "<!-- Add other navigation links as needed -->" and "<!-- ... other news items ... -->" in place of writing the full code. WRITE THE FULL CODE.
    - Repeat elements as needed to match the screenshot. For example, if there are 15 items, the code should have 15 items. DO NOT LEAVE comments like "<!-- Repeat for each news item -->" or bad things will happen.
    - For images, use placeholder images from https://placehold.co and include a detailed description of the image in the alt text so that an image generation AI can generate the image later.
    - If you need icons, use the lucide-react library. Here's an example of importing and using one: \`import { Camera } from "lucide-react"\` & \`<Camera color="red" size={48} />\`
    - If you need 3D graphics, use the @react-three/fiber library. Here's an example of importing and using one: \`import { Canvas } from "@react-three/fiber"\` & \`<Canvas><ambientLight /><Box ... />\`
    - If you can't use external texture, such as local file or online texture. Only use internal texture, such as solid color.
    - If you need to make HTTP requests, use the axios library. Here's an example of importing and using one: \`import axios from "axios"\` & \`axios.get("https://api.example.com/data")\`.
    - Please ONLY return the full React code starting with the imports, nothing else. It's very important for my job that you only return the React code with imports. DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\`.
    - ONLY IF the user asks for a dashboard, graph or chart, the recharts library is available to be imported, e.g. \`import { LineChart, XAxis, ... } from "recharts"\` & \`<LineChart ...><XAxis dataKey="name"> ...\`. Please only use this when needed.
  `)

  if (shadcn) {
    systemPrompt += `
    There are some prestyled components available for use. Please use your best judgement to use any of these components if the app calls for one.

    Here are the components that are available, along with how to import them, and how to use them:

    ${shadcnDocs
      .map(
        (component) => `
          <component>
          <name>
          ${component.name}
          </name>
          <import-instructions>
          ${component.importDocs}
          </import-instructions>
          <usage-instructions>
          ${component.usageDocs}
          </usage-instructions>
          </component>
        `
      )
      .join('\n')}
    `
  }

  systemPrompt += `
    NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.
  `

  return dedent(systemPrompt)
}
