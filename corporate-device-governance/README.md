# Corporate Device Governance and Usage Validation

A scheduled automation designed to support the governance of corporate devices by combining identity data, group membership, device information and recent activity signals obtained through Microsoft Graph.

The solution uses Microsoft Power Automate as the orchestration layer between Microsoft Entra ID, Microsoft Graph, human validation and Active Directory.

## Business problem

Corporate devices can remain assigned to users even when their actual need or usage has changed.

Reviewing whether a user should continue to have a corporate device may require checking several pieces of information manually:

- User identity
- Relevant group memberships
- Devices associated with the user
- Available recent device activity information
- Business validation from the responsible user

Repeating these checks user by user is time-consuming and difficult to scale when the number of records increases.

## Solution

I designed a recurring Power Automate workflow that periodically retrieves identity and device information through Microsoft Graph.

The automation consolidates the relevant data, applies business rules and prepares the information required for an authorized responsible user to validate whether the corporate device is still required.

Once the decision has been validated, a controlled script-based process updates the corresponding information in Active Directory.

## Architecture

```text
Scheduled recurrence
        |
        v
Power Automate
        |
        v
Microsoft Graph
        |
        +----------------------+
        |                      |
        v                      v
   User lookup           Group membership
        |                      |
        +----------+-----------+
                   |
                   v
             User devices
                   |
                   v
          Device activity data
                   |
                   v
          Data transformation
                   |
                   v
            Business rules
                   |
                   v
          Human validation
             /        \
           Yes        No
            \          /
             \        /
              v      v
          Validated decision
                   |
                   v
          Controlled script
                   |
                   v
          Active Directory
                   |
                   v
          Attribute updated
```

## Scheduled execution

The workflow runs automatically using a Power Automate recurrence trigger.

This allows the review process to be executed periodically without requiring a user to start the analysis manually.

A simplified execution cycle is:

```text
Recurrence
    |
    v
Identify users to review
    |
    v
Query Microsoft Graph
    |
    v
Retrieve identity information
    |
    v
Retrieve group memberships
    |
    v
Retrieve associated devices
    |
    v
Retrieve available activity data
    |
    v
Prepare validation data
```

## Microsoft Graph integration

Microsoft Graph is used as the main integration layer for retrieving identity and device information from Microsoft Entra ID and related Microsoft services.

Power Automate performs authenticated HTTP requests and processes the JSON responses returned by Microsoft Graph.

The workflow retrieves information such as:

- User identity data
- Directory identifiers
- Relevant group memberships
- Devices associated with the user
- Device identifiers
- Available device activity information

The exact production endpoints, identifiers and authentication configuration are intentionally excluded from this public case study.

A simplified integration pattern is:

```text
Power Automate
      |
      | Authenticated HTTP request
      v
Microsoft Graph
      |
      | JSON response
      v
Power Automate
      |
      v
Parse and transform data
      |
      v
Business logic
```

## Device usage assessment

One of the objectives of the automation is to provide an indication of whether an assigned corporate device appears to still be in active use.

The workflow retrieves an available recent activity signal and includes it in the information presented during the validation process.

This allows the decision to consider both device assignment and recent activity.

The activity timestamp is treated as a decision-support signal rather than absolute proof that a device is or is not being used.

## Data processing

Microsoft Graph responses are processed inside Power Automate before being used by the business logic.

The implementation includes operations such as:

- Authenticated HTTP requests
- JSON processing
- Parse JSON actions
- Array filtering
- Variables
- Conditions
- Iteration over API results
- Data transformation
- Comparison of directory information
- Evaluation of device activity
- Construction of validation data

## Human validation

The final decision is intentionally not fully automated.

Once identity, group and device information has been collected, the relevant information is presented to an authorized responsible user.

The responsible user determines whether the corporate device should remain assigned.

```text
Automated analysis
        |
        v
Relevant information
        |
        v
Responsible user
        |
     Yes / No
        |
        v
Validated decision
```

This human-in-the-loop design automates the repetitive investigation while keeping the final business decision with the appropriate person.

## Active Directory integration

After validation, the resulting decision can trigger a controlled update in Active Directory.

The update is performed through a script running inside the appropriate internal environment.

```text
Power Automate
      |
      v
Validated decision
      |
      v
Controlled execution
      |
      v
Automation script
      |
      v
Active Directory
      |
      v
Directory attribute updated
```

This creates a hybrid automation architecture connecting cloud services with an on-premises directory environment.

## Technical components

The solution combines:

- Microsoft Power Automate
- Microsoft Entra ID
- Microsoft Graph
- REST API integration
- Authenticated HTTP requests
- JSON processing
- Scheduled workflows
- User directory queries
- Group membership analysis
- Device discovery
- Device activity assessment
- Conditional business logic
- Human-in-the-loop validation
- Script-based automation
- Active Directory
- Cloud and on-premises integration

## Business impact

The automation removes most of the repetitive investigation required to review corporate device allocation and allows the process to scale to larger user populations without a proportional increase in manual effort.

A separate impact analysis documents the assumptions and estimated manual effort avoided:

[Operational impact analysis](IMPACT.md)

## Confidentiality

This case study presents an anonymized automation pattern. Production data, internal identifiers, credentials and confidential business rules are excluded.
