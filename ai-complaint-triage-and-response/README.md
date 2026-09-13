# AI-Assisted Complaint Intake and Classification

A Power Automate workflow that processes incoming emails, uses an AI model to determine whether each message should be treated as a complaint, creates a structured case when required and stores the relevant content in SharePoint.

The solution combines email automation, prompt-engineered AI classification, case creation, document storage and automatic responses in a single workflow.

## Business problem

Incoming emails have to be reviewed before they can be handled correctly.

Without automation, a user may need to:

- Open and read the message
- Check who sent it and understand its context
- Decide whether the content constitutes a complaint
- Save the relevant email content
- Create a case with a unique identifier
- Create the corresponding case folder
- Register the information in SharePoint
- Send the appropriate response

This process requires repetitive manual judgement and administrative work, and its workload grows directly with email volume.

## Solution

I designed a Power Automate workflow that handles the initial intake automatically.

The workflow extracts the email body and relevant metadata, sends the required context to an AI model and uses the classification result to determine the next steps.

When a message is identified as a complaint, the process creates a unique case reference, prepares the corresponding SharePoint structure, stores the email content and sends the configured response.

## Architecture

```text
Incoming email
      |
      v
Power Automate
      |
      v
Extract sender, subject and body
      |
      v
Prepare classification context
      |
      v
AI classification
      |
      +-----------------------+
      |                       |
      v                       v
 Complaint               Not complaint
      |                       |
      v                       v
Generate case ID        Alternative path
      |
      v
Create case folder
      |
      v
Store email content
      |
      v
Create / update SharePoint record
      |
      v
Automatic response
```

## Email processing

The workflow retrieves the information required to evaluate and register each message.

Typical inputs include:

- Sender
- Subject
- Email body
- Received date and time
- Message identifier

The body is cleaned or transformed where necessary before being used by the classification step and stored as part of the case record.

## AI classification and prompt engineering

The classification step is based on prompt engineering rather than a simple keyword rule.

The prompt provides the model with the context and criteria required to decide whether a message should be treated as a complaint. The decision can take into account both the source of the email and the meaning of the message, including whether the sender is expressing dissatisfaction, reporting a problem or making a complaint.

A simplified pattern is:

```text
Sender + subject + email body
             |
             v
     Classification prompt
             |
             v
          AI model
             |
             v
     Structured decision
        /          \
 Complaint      Not complaint
```

The output is kept structured so that Power Automate can use it reliably in subsequent conditions and actions.

Production prompts, internal criteria and confidential business rules are not included in this public repository.

## Case creation

When the message is classified as a complaint, the workflow creates a structured case automatically.

The process includes:

- Generating a unique case identifier
- Creating a dedicated case folder
- Storing the relevant email content
- Registering the case in SharePoint
- Recording the classification result
- Recording processing metadata

This removes the need to manually create and organize the case before it can be handled.

## SharePoint registration

SharePoint is used as the structured record and storage layer for the process.

Depending on the case, the stored information can include:

- Case identifier
- Email metadata
- Message content
- AI classification
- Processing status
- Processing date
- Response status
- Link to the case folder

This creates a consistent and traceable record for every complaint handled by the automation.

## Automatic response

Once the workflow has completed the required classification and case registration, it can send the configured automatic response.

The response stage is executed only after the required business conditions have been evaluated, avoiding the need for a user to manually prepare the initial acknowledgement or response for every case.

Internal response templates and routing rules are intentionally excluded from the public documentation.

## Technical components

The solution combines:

- Microsoft Power Automate
- Microsoft Outlook / Exchange email processing
- AI-based text classification
- Prompt engineering
- Structured AI outputs
- Email body extraction and transformation
- Conditional business logic
- Unique case ID generation
- SharePoint Lists
- SharePoint document libraries / folders
- Automated case registration
- Automated response handling
- Process traceability

## Business impact

The automation reduces both the manual analysis required to determine whether an email is a complaint and the administrative work required to create and register a case.

For a complete complaint, a conservative manual baseline of approximately 6 minutes per case is used in the impact analysis. This includes reading and interpreting the email, classification, case creation, content storage and response handling.

Detailed assumptions and scaling estimates are documented separately:

[Operational impact analysis](IMPACT.md)

## Confidentiality

This case study presents an anonymized automation pattern. Production data, internal identifiers, credentials and confidential business rules are excluded.
