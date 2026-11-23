TutorLedger – home tutor back-office software
Issue

Home tutors communicate with and control their students via WhatsApp and/or paper. Invoices can also often fail to be issued and/or followed up. Furthermore, tutors have difficulty seeing who has outstanding payments and whether or not they will have enough money to meet their expenditure (rent, transport and resources) next month. Tutoring businesses usually do not fail due to insufficient students. Instead, businesses fail due to late receipt of money, despite bills being received in good time.
Target audience

Self-employed home tutors that teach around between 10 and 30 students and who have no accountancy or administrative support.
Features
Students

Add, amend and suspend students each with a monthly charge.
Invoicing
Issue one batch of invoices for all current students. Then note when and how much has been received. Amend and/or remove erroneous information.
Outstanding payments
Overall and individual student’s outstanding balance together with the number of days the payment is past due. Students with the greatest numbers of days past due are listed first.
Reminders
Each invoice with an outstanding payment is shown as ‘Chase this invoice today’. Each such invoice is hyperlinked.
Bills
Note and follow expenditure (for example, rent, internet and electricity together with resources) and whether or not this has been met.
30/60/90 day Cash Flow Forecast
Estimate of future inflows (from outstanding invoices) and outflows (to outstanding bills).
What-If
Observe how the Cash Flow Forecast alters if a chosen student makes a payment 15 days later than due.

Live demo
https://tutor-backoffice.vercel.app

Demo notes
Whilst all the data in this demo is fictional (students’ names, email addresses of the form example.com and figures), there is no requirement to log in. This is a prototype built during a hackathon. Separate tutor accounts are the initial stage in implementing TutorLedger.

Business
Payer
The tutor.
Costing (provisionally)
No charge for up to 5 students. Beyond this, ₹299 per month for an unlimited number of students.
Benefits of moving away from a notebook
Instantly identify who has, and for how long, outstanding payments. Also ascertain the anticipated financial position ahead of rent becoming due. TutorLedger can also automatically issue invoices so tutors no longer need to do so manually.
Looking ahead
Automatic parent reminders; digital payment facilities; and separate tutor accounts.
Software

Based on Next.js, with TypeScript, Prisma and PostgreSQL (Neon). Hosted on Vercel. Developed using Codebenders (Nexen). Information relating to prompts and the development procedure can be found in [PROMPT_LOG.md](PROMPT_LOG.md).

To operate locally
1. Execute ‘npm install’.
2. Duplicate .env.example and rename the file .env. Enter appropriate details into this, including a value for the PostgreSQL DATABASE_URL.
3. Execute ‘node scripts/setup-db.mjs’ to set-up the schema and import test data.
4. Execute ‘npm run dev’. Then navigate to http://localhost:3000.
Display

Dashboard; Students (overview, detailed view and addition); Invoices (overview, detailed view and addition); Cash Flow Forecast; What-If; and Reminders. Bills (overview, detailed view and addition).
