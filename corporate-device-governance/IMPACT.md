# Operational Impact

This document estimates the operational impact of automating the corporate device review process.

The calculations are based on the manual activities required to obtain the same identity, group membership, device and activity information that is collected automatically through Microsoft Graph and Power Automate.

## Manual process

Without automation, each user review would require several manual checks:

1. Locate the user in the corporate identity directory
2. Review relevant group memberships
3. Identify devices associated with the user
4. Review available recent device activity information
5. Consolidate the results
6. Prepare the case for business validation

For this case study, a conservative baseline of approximately 3 minutes of manual investigation per user is used.

This baseline is an illustrative estimate, not a measured production result.

## Estimated manual effort

| Users reviewed | Estimated manual effort |
|---:|---:|
| 100 | ~5 hours |
| 500 | ~25 hours |
| 1,000 | ~50 hours |
| 2,500 | ~125 hours |
| 5,000 | ~250 hours |

## Automated process

With the automated workflow, the repetitive investigation stages are performed automatically.

Power Automate and Microsoft Graph retrieve and consolidate:

- User identity information
- Relevant group memberships
- Associated devices
- Available recent device activity information

Human intervention remains focused on the final validation decision.

This changes how the process scales: increasing the number of records primarily increases automated processing rather than human investigation time.

## Example scenario

For a population of 1,000 users:

```text
Estimated manual investigation
3 minutes x 1,000 users
= 3,000 minutes
= 50 hours

Automated investigation
Performed by Power Automate and Microsoft Graph

Human validation
Remains part of the process
```

Under these assumptions, approximately 50 hours of repetitive investigation can be avoided for every 1,000 users reviewed.

The final saving depends on the time required for human validation and any exceptions that require manual investigation.

## Scalability

The manual workload grows approximately in proportion to the number of users reviewed.

```text
100 users     -> ~5 hours
1,000 users   -> ~50 hours
5,000 users   -> ~250 hours
```

The automated approach allows larger user populations to be reviewed without requiring the same proportional increase in administrative effort.

## Additional business value

The automation can also contribute to:

- Identification of potentially unused corporate devices
- Recovery and reassignment of existing equipment
- Reduction of unnecessary hardware allocation
- Reduction of avoidable hardware purchases
- Improved asset governance
- More consistent review criteria
- Improved traceability of allocation decisions

Where reliable operational data is available, these benefits can be quantified separately from time savings.

## Potential cost-avoidance model

A hardware cost-avoidance estimate can be calculated using:

```text
Devices recovered or reassigned
x
Average replacement or acquisition cost per device
=
Estimated hardware cost avoided
```

No hardware cost-avoidance total is reported here because verified recovery counts and acquisition costs are not available.

## Measurement methodology

Time savings are estimated using:

```text
Estimated manual time per record
x
Number of records processed
=
Estimated manual effort avoided
```

For the current case study baseline:

```text
3 minutes
x
Number of users reviewed
```

Estimated values are clearly separated from measured production metrics.

Operational indicators relevant to this analysis include:

- Average manual investigation time
- Number of users reviewed per execution
- Number of devices reviewed
- Human validation time
- Potentially inactive devices identified
- Devices recovered
- Devices reassigned
- New purchases avoided
- Administrative hours saved
- Estimated cost avoidance
