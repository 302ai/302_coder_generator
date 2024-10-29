export const name = "Calendar";

export const importDocs = `
import { Calendar } from "/components/ui/calendar"
`;

export const usageDocs = `
const [date, setDate] = React.useState<Date | undefined>(new Date())

return (
  <Calendar
    mode="single"
    selected={date}
    onSelect={setDate}
    className="rounded-md border"
  />
)
`;
