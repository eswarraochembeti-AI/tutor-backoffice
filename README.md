TutorLedger

Currently, home tutors manage students via WhatsApp and paper. Tutors often neglect to issue and follow up invoices. They do not know who should be paying whom and cannot ascertain if next month’s income will be sufficient to meet their expenditure. Tutoring businesses almost never close due to insufficient numbers of students, but often because of late income and timely bill payment.

For:
An independent home tutor with approximately between 10 and 30 students. They have no access to an accountant or administrator.
Functionality

Students – create, search for and suspend students. Each has a monthly charge.
Invoices – in one action, produce invoices for all currently enrolled students. Note when and how much was paid. Amend or remove incorrect information.
Who I am owed money by – summary of overall debt. For each student, when they last paid and the amount still owed. Displayed ordered by most days in arrears.
Alerts – invoices in arrears are labelled ‘Chase this invoice today’. These are hyperlinked to the relevant invoice.
Bills – record and monitor expenditure (for example, on rent, internet and electricity plus for materials). Show whether these have been paid.
Cash Flow Forecast – compare anticipated income from outstanding invoices with planned expenditure on outstanding bills. Display the resulting figure for 30, 60 and 90 day periods.
What if? – analyse how the Cash Flow Forecast is affected if a selected student delays payment by 15 days.

Live demo
[tutor-backoffice.vercel.app
]

Information within the demo is wholly fictional including student names, example.com email addresses and figures. There is no log-in functionality. This is a prototype for a hackathon. Providing tutors with individual log-ins is the initial stage towards implementing TutorLedger in practice.

Business
Payer – the tutor.
Price (proposed) – free for 5 students or less; then ₹299 per month for an unlimited number of students.
Benefits over paper-based systems – instantly identifies who and when people owe money. Displays an anticipated cash position for next month even prior to the rent fall due. And automatically produces invoices, so that tutors no longer need to manually complete them.
Future functionality – automated alerts to parents, online payment facility and individual tutor log-ins.
Technology

Built using Next.js, TypeScript, Prisma and PostgreSQL (Neon). Hosted on Vercel. Developed using Codebenders (Nexen). Details of prompts and development are documented within [PROMPT_LOG.md](PROMPT_LOG.md).
Local execution

1. Run `npm install`.
2. Duplicate `.env.example` into `.env`. Insert suitable information (including a PostgreSQL `DATABASE_URL`, alongside other relevant details).
3. Execute `node scripts/setup-db.mjs` to both build the schema and populate it with test information.
4. Run `npm run dev` and browse to http://localhost:3000.
Interface

Dashboard; Students (overview; detailed view; and creation); Invoices (overview; detailed view; and creation); Cash Flow Forecast; What if?; Alerts; Bills (overview; detailed view; and creation).
