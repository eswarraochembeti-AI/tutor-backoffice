Add and manage students' information
Generate invoices monthly
Mark invoices as paid
See who owes money, how much, and how long it is overdue on the dashboard
View a 30/60/90-day cash flow forecast based on invoices and bills
Run a what-if check on the impact of a student paying 15 days late
Receive alerts such as 'Chase this invoice today'

Develop a project plan for the web app that I will build to manage home tutors.

It should include precisely these 6 capabilities:

1. Manage the details of students.
2. Create monthly invoices and mark the invoices as paid.
3. Show which customers owe money, how much they owe, and how late the payments are on the dashboard.
4. Provide 30/60/90-day cash flow forecast based on the invoices and expected bills.
5. Conduct a what-if analysis assuming that the student pays 15 days late.
6. Provide alert messages like "Chase this invoice today".

Only use sample data. The application should be very simple and mobile-friendly.

Don't implement login, authentication, online payments, WhatsApp integration, or any other extra capabilities.

First create the project plan. Don't code yet.
"Employed Nexen Guide; finished brand design phase (Phase 3 out of 11)."
"Nexen Guide Step 4: agreed on 10 proposed screens (Dashboard, Students, Invoices, Forecast, What-If, Alerts, and more)."
"Step 5 of Nexen Guide: selected Monolith Architecture (most straightforward to implement)."
"Step 7 of Nexen Guide: no third party API use; kept the app self-sufficient."
"Nexen Guide Step 8: Review of generated business logic (9 flows, 93 business rules, 25 validation rules) and retained it."
"Step 9 in Nexen Guide: reviewed the schema produced (students, invoices, bills, alerts), and maintained it."
"Step 10 of the Nexen Guide: reviewed the generated API list (dashboard, students, invoices, bills, alerts, cash-flow-forecast, what-if) and saved it."
"Ran business logic, data model, and API layer again after creating the bills screens."
Generation hung at 14/89 (timeout), so we used “Finalize Generation” to fix it."
"Dashboard displayed 'Internal error' during first execution. The dev server logs were pasted in Nexen chat to create the Neon tables and seed data."
"Error in dashboard - 'Internal error.' Put log from the development server in Nexen chat and asked it to make the tables, seed the data, and restart."
"Neon Connection Failure on port 5432 on my network. Switching to mobile hotspot and having Nexen build the tables and populate the data."
"I fixed the React 'missing key' error on OwingStudentsList and other list components."
"Getting 'Unauthorized' for What-If. Signed in as the demo user and fixed the authorization for the what-if route by Nexen."
"What-If" failed with Unauthorized because the endpoint requires a JWT which no one provides. Decided to use the same policy as on the dashboard because there is only demo data in the application.
"What-If returned Unauthorized as it needs a JWT which nothing is issuing. Decided to go with open access of the dashboard (sample data only), and Nexen stripped out the check."
"Update the currency display to use ₹ instead of £ in the entire app and also seed data and helper formats. Use Indian numbering format."
"Fix the React missing-key issue in OwingStudentsList.tsx and check if other list components have the same problem as well."
"Asked Nexen to replace £ with ₹. Done."
"Asked Nexen regarding React missing-key warning; it stated that keys were already correct."
"All pages reviewed. Seed dates for 2000 and 2025 resulted in the forecast and what-if analysis being invalid. Requested that Nexen regenerate seed dates based on current date with realistic Rupees amounts."
Requested Nexen to rewrite the seed using relative dates and Indian students. Decided not to go for an Alert model as Alerts are generated on the basis of overdue invoices."
"Resolved Next.js warning for dynamic routes' params."
"The issue of not updating the dashboard total when an invoice was deleted was raised, and Nexen was asked to fix it."
"'Noted that the dashboard total was unchanged when an invoice is deleted. Nexen has verified the API and the dashboard totals, which were correct, so I tested again using a new unpaid invoice.'"
"The dashboard total seemed outdated after deleting an invoice. Nexen validated that the API was correct and implemented no-cache headers on the dashboard and cash flow routes."
"Mark as unpaid on an Unauthorized bill returned, similar missing login error as What-If. Requested Nexen to strip token validation on all API endpoints, as there is no actual data in the application."
"Checked What If?. It gave ₹0.00 for a student with an overdue invoice. This is correct, since the shifted date was still in the same window period. Re-tested using a student whose invoice is due in the coming 3 weeks."
"Used billing month instead of raw invoice IDs, and changed 'Due now' to 'Due in N days'."
"Requested from Nexen to fix 9 type errors for next successful build."
"Implemented retry mechanism for sleeping database of Neon."
"The React key warning reappeared when we added the Due-in-N-days functionality. Requested that Nexen make the key unique."
"Fixed the React key error in OwingStudentsList using the proper field names from /api/dashboard."
"Nexen found 3 new type errors; requested it to roll back the fix such that next build passes."
"“What-if” changed back to £ and plain IDs. Requested Nexen to revert ₹, month names and the unchanged message along with fixing £/en-GB in 14 other files."
"Alerts page still displayed raw invoice IDs. Requested Nexen to display the billing month rather than that. Alerts/page.tsx file was modified accordingly."