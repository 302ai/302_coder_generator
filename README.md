# 💻🤖 Welcome to 302.AI's AI Code Generator 2.0! 🚀✨

[中文](README_zh.md) | [English](README.md) | [日本語](README_ja.md)

Open-source version of the [AI Code Generator 2.0](https://302.ai/tools/coder/) from [302.AI](https://302.ai).
You can directly log in to 302.AI for a zero-code, zero-configuration online experience.
Alternatively, customize this project to suit your needs, integrate 302.AI's API KEY, and deploy it yourself.

## ✨ About 302.AI ✨
[302.AI](https://302.ai) is a pay-as-you-go AI application platform, bridging the gap between AI capabilities and practical implementation.
1. 🧠 Comprehensive AI capabilities: Incorporates the latest in language, image, audio, and video models from leading AI brands.
2. 🚀 Advanced application development: We build genuine AI products, not just simple chatbots.
3. 💰 No monthly fees: All features are pay-per-use, fully accessible, ensuring low entry barriers with high potential.
4. 🛠 Powerful admin dashboard: Designed for teams and SMEs - managed by one, used by many.
5. 🔗 API access for all AI features: All tools are open-source and customizable (in progress).
6. 💡 Powerful development team: Launching 2-3 new applications weekly with daily product updates. Interested developers are welcome to contact us.

## Project Features
1. 🤖 Intelligent Code Generation: Automatically generate code based on your requirements.
2. ✍️ Flexible Editing: Adjust and modify code content at any time during generation.
3. 🎨 UI Flexibility: Supports shadcn/ui component library for quickly creating beautiful interfaces.
4. 🌟 Supports three.js, easily implement 3D visualization functions.
5. 🛠️ Prompt Optimization: Optimize prompts to make AI-generated content more accurate.
6. 🖼️ Image Assistance: Supports uploading design images for generating corresponding code based on the images.
7. 💬 Multi-Round Interaction: Continuous conversation support to dynamically adjust code generation based on feedback.
8. 🔗 Code Referencing: Reference generated code snippets and allow AI to make corresponding modifications.
9. 📤 Easy Sharing: Easily share generated code and let more people appreciate your work.
10. 🌙 Thoughtful Dark Mode: Offers a dark mode to protect your eye health.
11. 🌐 Comprehensive Internationalization: Supports interface switching between Chinese, English, and Japanese.

With AI Code Generator 2.0, anyone can become a code creator! 🎉💻 Let's explore the world of AI-driven code together! 🌟🚀

## Tech Stack
- Next.js 14
- Tailwind CSS
- Shadcn UI
- Sandpack
- Vecel AI SDK

## Development & Deployment
1. Clone the project `git clone https://github.com/302ai/302_coder_generator`
2. Install dependencies `pnpm install`
3. Configure 302's API KEY as per .env.example
4. Run the project `pnpm dev`
5. Build and deploy `docker build -t coder-generator . && docker run -p 3000:3000 coder-generator`

## Interface Preview
![Interface Preview](docs/preview.png)
