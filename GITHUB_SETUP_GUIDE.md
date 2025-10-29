# GitHub Setup Guide

This guide will help you complete the GitHub setup for InvoicePro Desktop, including creating issues, milestones, labels, and a project board.

## Prerequisites

Make sure you have the GitHub CLI installed. If not, install it from: https://cli.github.com/

```bash
# Login to GitHub CLI
gh auth login
```

## Step 1: Create Labels

Run these commands to create labels for issues:

```bash
# Navigate to your repository
cd /home/user/Invoicing_app

# Create labels
gh label create "feature" --description "New feature or request" --color "0e8a16"
gh label create "enhancement" --description "Enhancement to existing feature" --color "a2eeef"
gh label create "bug" --description "Something isn't working" --color "d73a4a"
gh label create "priority:high" --description "High priority" --color "e99695"
gh label create "priority:medium" --description "Medium priority" --color "fef2c0"
gh label create "priority:low" --description "Low priority" --color "d4c5f9"
gh label create "documentation" --description "Improvements or additions to documentation" --color "0075ca"
gh label create "good first issue" --description "Good for newcomers" --color "7057ff"
gh label create "help wanted" --description "Extra attention is needed" --color "008672"
```

## Step 2: Create Milestones

```bash
# Create milestones based on the roadmap
gh api repos/:owner/:repo/milestones -f title="Week 1: Foundation" -f description="Project initialization and core features" -f due_on="2025-11-05T00:00:00Z"

gh api repos/:owner/:repo/milestones -f title="Week 2: Dashboard" -f description="Dashboard and Analytics implementation" -f due_on="2025-11-12T00:00:00Z"

gh api repos/:owner/:repo/milestones -f title="Week 3: Email Integration" -f description="Email functionality implementation" -f due_on="2025-11-19T00:00:00Z"

gh api repos/:owner/:repo/milestones -f title="Week 4: Recurring Invoices" -f description="Recurring invoice system" -f due_on="2025-11-26T00:00:00Z"

gh api repos/:owner/:repo/milestones -f title="Week 5: Expense Tracking" -f description="Expense tracking features" -f due_on="2025-12-03T00:00:00Z"

gh api repos/:owner/:repo/milestones -f title="Week 6: Quotes" -f description="Quote and estimate functionality" -f due_on="2025-12-10T00:00:00Z"
```

## Step 3: Create GitHub Issues

### Dashboard Feature Issues

```bash
gh issue create \
  --title "Implement Dashboard Layout" \
  --body "Create the main dashboard layout with responsive design.

**Tasks:**
- [ ] Design dashboard wireframe
- [ ] Create dashboard component
- [ ] Implement responsive grid layout
- [ ] Add navigation sidebar
- [ ] Test on different screen sizes

**Milestone:** Week 2
**Priority:** High" \
  --label "feature,priority:high" \
  --milestone "Week 2: Dashboard"

gh issue create \
  --title "Add Revenue Analytics Charts" \
  --body "Implement revenue analytics charts for the dashboard.

**Tasks:**
- [ ] Choose charting library (Chart.js, D3.js, etc.)
- [ ] Create revenue data model
- [ ] Implement line chart for revenue over time
- [ ] Add bar chart for monthly comparison
- [ ] Add data filtering options
- [ ] Ensure charts are responsive

**Milestone:** Week 2
**Priority:** High" \
  --label "feature,priority:high" \
  --milestone "Week 2: Dashboard"

gh issue create \
  --title "Create Recent Invoices Widget" \
  --body "Display recent invoices on the dashboard with quick actions.

**Tasks:**
- [ ] Design widget layout
- [ ] Fetch recent invoices from database
- [ ] Display invoice details (number, client, amount, status)
- [ ] Add quick action buttons (view, edit, send)
- [ ] Implement pagination or infinite scroll
- [ ] Add sorting options

**Milestone:** Week 2
**Priority:** Medium" \
  --label "feature,priority:medium" \
  --milestone "Week 2: Dashboard"

gh issue create \
  --title "Build Payment Status Overview" \
  --body "Create a widget showing payment statistics and status overview.

**Tasks:**
- [ ] Calculate payment statistics (paid, pending, overdue)
- [ ] Create visual indicators for payment status
- [ ] Add pie chart or donut chart
- [ ] Display total amounts per status
- [ ] Add filtering by date range
- [ ] Implement drill-down functionality

**Milestone:** Week 2
**Priority:** High" \
  --label "feature,priority:high" \
  --milestone "Week 2: Dashboard"
```

### Email Integration Issues

```bash
gh issue create \
  --title "Implement SMTP Configuration Interface" \
  --body "Create a settings interface for SMTP email configuration.

**Tasks:**
- [ ] Design SMTP settings form
- [ ] Add fields for server, port, username, password
- [ ] Implement secure storage for credentials
- [ ] Add test email functionality
- [ ] Support multiple email providers (Gmail, Outlook, custom)
- [ ] Validate SMTP settings
- [ ] Add encryption options (TLS/SSL)

**Milestone:** Week 3
**Priority:** High" \
  --label "feature,priority:high" \
  --milestone "Week 3: Email Integration"

gh issue create \
  --title "Create Email Template Editor" \
  --body "Build a visual editor for creating and customizing email templates.

**Tasks:**
- [ ] Design template editor interface
- [ ] Implement WYSIWYG editor
- [ ] Add template variables (client name, invoice number, etc.)
- [ ] Create default email templates
- [ ] Add template preview functionality
- [ ] Support HTML and plain text emails
- [ ] Allow saving multiple templates

**Milestone:** Week 3
**Priority:** High" \
  --label "feature,priority:high" \
  --milestone "Week 3: Email Integration"

gh issue create \
  --title "Implement Invoice Email Sending" \
  --body "Add functionality to send invoices via email with PDF attachments.

**Tasks:**
- [ ] Integrate SMTP library (nodemailer or similar)
- [ ] Generate PDF from invoice data
- [ ] Attach PDF to email
- [ ] Send email with template
- [ ] Add send confirmation
- [ ] Handle email sending errors
- [ ] Add retry mechanism
- [ ] Log sent emails

**Milestone:** Week 3
**Priority:** High" \
  --label "feature,priority:high" \
  --milestone "Week 3: Email Integration"

gh issue create \
  --title "Add Email Tracking System" \
  --body "Implement email tracking to monitor when emails are opened and links are clicked.

**Tasks:**
- [ ] Add tracking pixel to emails
- [ ] Implement click tracking for links
- [ ] Store tracking data in database
- [ ] Display tracking status in UI
- [ ] Add notification for opened emails
- [ ] Create email activity log
- [ ] Respect privacy settings

**Milestone:** Week 3
**Priority:** Medium" \
  --label "feature,priority:medium" \
  --milestone "Week 3: Email Integration"
```

### Recurring Invoices Issues

```bash
gh issue create \
  --title "Design Recurring Invoice Setup Interface" \
  --body "Create UI for setting up recurring invoices with schedules.

**Tasks:**
- [ ] Design recurring invoice form
- [ ] Add frequency selector (daily, weekly, monthly, yearly)
- [ ] Implement custom schedule options
- [ ] Add start and end date pickers
- [ ] Display next invoice date
- [ ] Add invoice template selection
- [ ] Implement form validation

**Milestone:** Week 4
**Priority:** High" \
  --label "feature,priority:high" \
  --milestone "Week 4: Recurring Invoices"

gh issue create \
  --title "Implement Automated Invoice Generation" \
  --body "Build system to automatically generate invoices based on schedule.

**Tasks:**
- [ ] Create background task scheduler
- [ ] Implement invoice generation logic
- [ ] Check schedules daily
- [ ] Generate invoices at scheduled times
- [ ] Handle generation errors
- [ ] Send notifications for generated invoices
- [ ] Update next invoice date
- [ ] Log generation history

**Milestone:** Week 4
**Priority:** High" \
  --label "feature,priority:high" \
  --milestone "Week 4: Recurring Invoices"

gh issue create \
  --title "Add Recurring Invoice Management" \
  --body "Create interface to view, edit, pause, and cancel recurring invoices.

**Tasks:**
- [ ] List all recurring invoices
- [ ] Add edit functionality
- [ ] Implement pause/resume feature
- [ ] Add cancel option with confirmation
- [ ] Display status (active, paused, cancelled)
- [ ] Show next invoice date
- [ ] Display generation history
- [ ] Add search and filter options

**Milestone:** Week 4
**Priority:** Medium" \
  --label "feature,priority:medium" \
  --milestone "Week 4: Recurring Invoices"
```

### Expense Tracking Issues

```bash
gh issue create \
  --title "Create Expense Entry Form" \
  --body "Build a form for entering and tracking business expenses.

**Tasks:**
- [ ] Design expense entry form
- [ ] Add fields (date, amount, category, description, vendor)
- [ ] Implement category selection
- [ ] Add payment method field
- [ ] Support multiple currencies
- [ ] Add tax-deductible checkbox
- [ ] Implement form validation
- [ ] Add receipt attachment option

**Milestone:** Week 5
**Priority:** High" \
  --label "feature,priority:high" \
  --milestone "Week 5: Expense Tracking"

gh issue create \
  --title "Implement Expense Categories Management" \
  --body "Create system for managing expense categories.

**Tasks:**
- [ ] Create default expense categories
- [ ] Add interface to create custom categories
- [ ] Allow editing and deleting categories
- [ ] Implement category colors/icons
- [ ] Add category-based filtering
- [ ] Display category statistics
- [ ] Support subcategories

**Milestone:** Week 5
**Priority:** Medium" \
  --label "feature,priority:medium" \
  --milestone "Week 5: Expense Tracking"

gh issue create \
  --title "Add Receipt Attachment and Scanning" \
  --body "Implement functionality to attach and scan receipts for expenses.

**Tasks:**
- [ ] Add file upload functionality
- [ ] Support multiple image formats
- [ ] Implement receipt scanning (OCR optional)
- [ ] Store receipt files securely
- [ ] Add receipt preview
- [ ] Allow downloading receipts
- [ ] Implement receipt deletion
- [ ] Add image optimization

**Milestone:** Week 5
**Priority:** Medium" \
  --label "feature,priority:medium" \
  --milestone "Week 5: Expense Tracking"

gh issue create \
  --title "Build Expense Reports" \
  --body "Create comprehensive expense reporting functionality.

**Tasks:**
- [ ] Design expense report layout
- [ ] Add date range filtering
- [ ] Group expenses by category
- [ ] Calculate totals and subtotals
- [ ] Add charts for expense breakdown
- [ ] Implement export to PDF
- [ ] Add export to CSV/Excel
- [ ] Include receipt attachments in reports

**Milestone:** Week 5
**Priority:** High" \
  --label "feature,priority:high" \
  --milestone "Week 5: Expense Tracking"
```

### Quotes & Estimates Issues

```bash
gh issue create \
  --title "Create Quote/Estimate Interface" \
  --body "Build interface for creating and managing quotes and estimates.

**Tasks:**
- [ ] Design quote creation form
- [ ] Reuse invoice components where applicable
- [ ] Add quote-specific fields (valid until date, terms)
- [ ] Implement line items with pricing
- [ ] Add notes and terms sections
- [ ] Calculate totals with taxes
- [ ] Add quote preview
- [ ] Implement save functionality

**Milestone:** Week 6
**Priority:** High" \
  --label "feature,priority:high" \
  --milestone "Week 6: Quotes"

gh issue create \
  --title "Implement Quote Templates" \
  --body "Create customizable templates for quotes and estimates.

**Tasks:**
- [ ] Design template structure
- [ ] Create default quote templates
- [ ] Add template customization options
- [ ] Support branding (logo, colors)
- [ ] Allow saving custom templates
- [ ] Implement template selection
- [ ] Add template preview

**Milestone:** Week 6
**Priority:** Medium" \
  --label "feature,priority:medium" \
  --milestone "Week 6: Quotes"

gh issue create \
  --title "Add Convert Quote to Invoice" \
  --body "Implement functionality to convert accepted quotes into invoices.

**Tasks:**
- [ ] Add convert button to quote view
- [ ] Copy quote data to new invoice
- [ ] Update quote status to converted
- [ ] Link quote and invoice
- [ ] Adjust dates automatically
- [ ] Update invoice number sequence
- [ ] Add confirmation dialog
- [ ] Notify on successful conversion

**Milestone:** Week 6
**Priority:** High" \
  --label "feature,priority:high" \
  --milestone "Week 6: Quotes"

gh issue create \
  --title "Implement Quote Status Tracking" \
  --body "Add system for tracking quote status throughout lifecycle.

**Tasks:**
- [ ] Define quote statuses (draft, sent, viewed, accepted, rejected)
- [ ] Add status field to quote model
- [ ] Create status update interface
- [ ] Display status in quote list
- [ ] Add status filtering
- [ ] Implement status change notifications
- [ ] Track status history
- [ ] Add status-based actions

**Milestone:** Week 6
**Priority:** Medium" \
  --label "feature,priority:medium" \
  --milestone "Week 6: Quotes"
```

## Step 4: Create GitHub Project Board

```bash
# Create a new project
gh project create --title "InvoicePro Desktop Development" --body "Project board for tracking InvoicePro Desktop development tasks"

# Note: The project creation via CLI creates a Project (Classic).
# For the new Projects experience, you'll need to use the web interface.
```

### Manual Setup for GitHub Projects (Recommended)

Since GitHub Projects (new) has better features, follow these steps in the web interface:

1. Go to your repository: https://github.com/JNicometo/Invoicing_app
2. Click on "Projects" tab
3. Click "New project"
4. Choose "Board" view
5. Name it "InvoicePro Desktop Development"
6. Add these columns:
   - **Backlog** - Issues that are planned but not yet scheduled
   - **This Week** - Issues planned for the current week
   - **In Progress** - Currently being worked on
   - **Testing** - Completed and in testing phase
   - **Done** - Completed and verified

7. Go to each issue and add it to the project
8. Move all issues to the "Backlog" column initially

### Automation Rules (Optional)

Add these automation rules to your project:

- **Auto-add items**: Automatically add new issues and PRs to the project
- **Auto-archive**: Archive items when they are closed
- **Status sync**: Update issue status when moved between columns

## Step 5: Verify Setup

```bash
# List all issues
gh issue list --limit 50

# List all milestones
gh api repos/:owner/:repo/milestones

# List all labels
gh label list

# View project details
gh project list
```

## Summary

After running all these commands, you will have:

- ✅ Comprehensive labels for categorizing issues
- ✅ Milestones for tracking weekly progress
- ✅ 20+ detailed issues covering all major features
- ✅ GitHub Project board for visual task management
- ✅ All issues assigned to appropriate milestones
- ✅ Priority labels on all issues

## Next Steps

1. Review and refine issue descriptions as needed
2. Assign issues to team members
3. Start working on Week 1/2 issues
4. Update project board as work progresses
5. Use issue templates for new issues

## Tips

- Use issue references in commit messages (e.g., `fixes #1`, `closes #5`)
- Link PRs to issues for automatic tracking
- Update milestones as schedules change
- Review project board in daily standups
- Use labels to filter and find issues quickly

---

For more information on GitHub CLI, visit: https://cli.github.com/manual/
