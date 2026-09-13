# Employee Onboarding and Offboarding Automation

A production system for employee onboarding and offboarding requests, combining Power Apps, Power Automate, SharePoint, document generation and custom connectors to internal APIs.

## Business problem

Employee lifecycle requests require coordinated data collection, HR authorization, signed documentation, notifications and updates across business applications. Manual handling involves repeatedly transferring information between forms, documents, lists and systems.

The process also needs to distinguish between submitting a request and authorizing its execution.

## Solution

I built a Power Apps form that initiates the process and registers the submitted information in a SharePoint list. The operation type determines the subsequent workflow and document template.

Power Automate generates the document, coordinates HR review and validation, and invokes the corresponding internal API operation through a custom connector defined with Swagger. The connector sends a JSON payload containing the required request data.

Both onboarding and offboarding follow the same review, signature and validation pattern. Their API operations depend on the selected request type.

## Workflow

1. A user submits an onboarding or offboarding request in Power Apps, with validation checks in the form.
2. The request data is registered in a SharePoint list.
3. Power Automate populates the appropriate Word template and converts the document to PDF.
4. A request folder is created and the document is made available for HR review.
5. The HR manager receives an email containing a link to the folder and a **Validate** button.
6. The manager opens the PDF in Adobe or a compatible PDF viewer, reviews it, applies a digital signature and saves the file.
7. The manager then returns to the email and selects **Validate**.
8. After validation, Power Automate invokes the operation-specific API through the custom connector, passing the required data as JSON.
9. The process retains the signed and validated document in its corresponding HR SharePoint folder, sends email notifications and creates or updates the relevant SharePoint records and application information.

The diagram below summarizes the authorization and execution sequence:

```text
Power Apps form
       |
       v
SharePoint request record
       |
       v
Operation-specific Word template
       |
       v
PDF generation and request folder
       |
       v
Email to HR with folder link
       |
       v
HR reviews, digitally signs and saves PDF
       |
       v
HR selects Validate in the email
       |
       v
Power Automate selects the operation
       |
       v
Custom connector defined with Swagger
       |
       | JSON request
       v
Internal API
```

## HR authorization and document signature

Signature and workflow validation are separate human actions. The manager signs and saves the PDF, then explicitly validates the request using the button in the email.

The validation action authorizes the subsequent API execution. Saving the PDF alone is not described as the execution trigger.

This case study describes the human signature and validation sequence; it does not claim automated cryptographic verification of the PDF signature.

## Custom connectors and internal APIs

I created custom connectors using Swagger definitions to expose internal API operations to Power Automate. The workflow selects the relevant operation and passes the required data in a structured JSON request.

For onboarding, the API creates the user in the internal system after HR has signed and validated the request. The environment has an existing synchronization with AD/Azure.

For offboarding, the workflow invokes the corresponding internal API operation after the same authorization sequence. The internal implementation of that operation is outside the scope of this public case study.

Power Automate interacts with the APIs rather than writing directly to the database. The existing directory synchronization is a separate part of the environment.

## Document management and coordination

SharePoint provides the structured request record and document storage. Word templates and PDF conversion support consistent documentation for each operation type.

Dedicated HR folders organize the signed and validated documents. Email notifications inform the relevant users, while subsequent SharePoint records and application updates coordinate the remaining administrative work.

## Technical components

- Microsoft Power Apps and form validation
- Microsoft Power Automate
- SharePoint Lists and document storage
- Custom connectors defined with Swagger
- Internal API integration
- JSON request payloads
- Operation-based workflow routing
- Word template population and PDF conversion
- HR review, digital signature and explicit email validation
- Email notifications
- Business application integration

## Business impact

The system automates document preparation, information transfer, notifications and operational API calls while retaining HR authorization as a human responsibility.

[Operational impact analysis](IMPACT.md)

## Confidentiality

This case study presents an anonymized production workflow. Employee data, signed documents, internal endpoints, production Swagger definitions, JSON payloads, credentials and proprietary business rules are excluded.
