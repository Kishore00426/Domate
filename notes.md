# 1. AC SERVICES (Category)

Subcategories

AC General Service

AC Repair

AC Installation

AC Uninstallation

AC Gas Refill

AC Deep Cleaning

AC Inspection & Diagnosis

# 2. ELECTRICIAN (Category)

Subcategories

Switch & Socket Services

Light & Fan Services

Wiring & Cabling

Inverter & Stabilizer Services

Doorbell & CCTV Installation

Electrical Inspection & Troubleshooting

Example services later:
“Power socket fitting”, “Ceiling fan installation”, “MCB replacement”

# 3. PLUMBING (Category)

Subcategories

Tap & Mixer Services

Pipe Leakage & Blockage

Bathroom & Kitchen Plumbing

Toilet & Flush Services

Water Tank & Motor Services

Plumbing Inspection

# 4. CARPENTER (Category)

Subcategories

Furniture Assembly

Furniture Repair

Door & Window Services

Modular Kitchen Repair

Drilling & Wall Mounting

Custom Carpentry Work

# 5. HOME CLEANING (Category)

Subcategories

Full Home Deep Cleaning

Kitchen Deep Cleaning

Bathroom Deep Cleaning

Sofa & Carpet Cleaning

Mattress Cleaning

Balcony & Utility Cleaning

Post-Construction Cleaning

# 6. APPLIANCE REPAIR (Category)

Subcategories

Washing Machine Repair

Refrigerator Repair

Microwave Oven Repair

Dishwasher Repair

Water Purifier (RO) Repair

Chimney & Hob Repair

# 7. TV & ENTERTAINMENT APPLIANCES (Category)

Subcategories

TV Installation & Uninstallation

TV Repair

Set-Top Box Installation

Home Theatre Installation

Speaker & Sound System Setup

# 8. PAINTING & WALL SERVICES (Category)

Subcategories

Interior Painting

Exterior Painting

Wall Texture & Wallpaper

Waterproofing

Wall Crack & Damage Repair

# 9. PEST CONTROL (Category)

Subcategories

General Pest Control

Cockroach Control

Termite Control

Bed Bug Control

Mosquito Control

Rodent Control

# 10. WATERPROOFING (Category)

Subcategories

Bathroom Waterproofing

Terrace Waterproofing

Wall Seepage Treatment

Basement Waterproofing

# 11. PACKERS & MOVERS (Category)

Subcategories

Local House Shifting

Intercity Moving

Office Relocation

Packing Only Services

Loading & Unloading

# 12. WOMEN’S SALON (Category)

Subcategories

Hair Care

Skin Care

Waxing

Threading & Facial Hair

Manicure & Pedicure

Bridal & Occasion Grooming

# 13. WOMEN’S SPA (Category)

Subcategories

Relaxation Massage

Deep Tissue Massage

Body Scrub & Polish

Head & Shoulder Massage

# 14. WOMEN’S MAKEUP & BEAUTY (Category)

Subcategories

Party Makeup

Bridal Makeup

Engagement Makeup

Reception Makeup

Airbrush Makeup

Saree Draping

(✔️ fully separate from salon & spa, as you requested)

# 15. MEN’S SALON (Category)

Subcategories

Haircut & Styling

Beard Grooming

Hair Color

Facial & Cleanup

Head Massage

# 16. MEN’S SPA (Category)

Subcategories

Body Massage

Stress Relief Therapy

Pain Relief Massage

# 17. FITNESS & WELLNESS (Category)

Subcategories

Personal Trainer at Home

Yoga at Home

Zumba / Dance Fitness

Physiotherapy

Post-Injury Rehab

# 18. HOME SECURITY & SMART SERVICES (Category)

Subcategories

CCTV Installation

Smart Lock Installation

Video Doorbell Installation

Alarm System Setup

# 19. COMPUTER & IT SERVICES (Category)

Subcategories

Laptop Repair

Desktop Repair

Software Installation

WiFi & Network Setup

Data Recovery

# 20. EVENT & OCCASION SERVICES (Category)

Subcategories

Birthday Decoration

Anniversary Decoration

Balloon Decoration

Festival Decoration


# *****************************************************************************


🔁 SERVICE PROVIDER SIDE FLOW (END-TO-END)
1️⃣ Entry Point
Options

Become a Professional (Navbar CTA)

Provider Login

👉 Separate from user login
👉 Separate role: service_provider

2️⃣ Registration / Onboarding Flow
Step 1: Basic Details

Full Name

Phone (OTP verification)

Email (optional)

Button: Continue

Step 2: Skill Selection

Choose Category
(AC Services, Plumbing, Electrical, Salon at Home, etc.)

Choose Sub-Services
(AC repair, AC installation, etc.)

Button: Next

Step 3: Service Area

City

Pincode(s)

Radius (optional)

Button: Next

Step 4: Documents (Verification)

ID Proof (Aadhaar / PAN)

Address Proof

Profile Photo

Status: Pending Verification

Button: Submit for Review

3️⃣ Admin Verification (Background Process)

Admin:

Reviews documents

Approves / Rejects

Can request re-upload

Provider status:

pending

approved

rejected

Only approved providers can go online.

4️⃣ Provider Dashboard (After Approval)
Key Sections

Availability Toggle (Online / Offline)

Today’s Jobs

Earnings Summary

Rating Overview

5️⃣ Availability Control

Provider can:

Go Online / Offline

Set working hours

Block specific days

👉 Offline = no job requests

6️⃣ Job Request Flow
When a booking is made:

Provider receives:

Service type

Location

Time slot

Estimated earning

Actions:

Accept

Decline

⏱ Accept timer (ex: 60 seconds)

7️⃣ Job Execution Flow

After Accepting:

Navigate to Customer

Start Job

Add spare parts (if any)

Complete Job

Customer confirmation required before completion.

8️⃣ Payment & Earnings

Online payment → auto credited

Cash → provider collects (optional)

Platform commission deducted

Earnings shown as:

Today

This week

Total

9️⃣ Rating & Feedback

After completion:

Customer rates provider

Review affects:

Job priority

Visibility

Trust score

🔟 Provider Profile & Performance

Provider can see:

Completed jobs

Rating

Complaints (if any)

Account status

1️⃣1️⃣ Support & Issues

Report job issue

Raise payout issue

Contact admin

🧠 STATUS FLOW (IMPORTANT)
Registered
→ Pending Verification
→ Approved
→ Online
→ Job Assigned
→ Job Completed
→ Rated

🔑 CORE RULES (IMPORTANT FOR LOGIC)

Provider must be approved to go online

Low rating → fewer jobs

Repeated cancellation → account suspension

ID verification is mandatory

┌──────────────┐
│   CATEGORY   │
└──────┬───────┘
       │ 1
       │
       │ n
┌──────▼──────────┐
│   SUBCATEGORY   │
└──────┬──────────┘
       │ 1
       │
       │ n
┌──────▼──────────┐
│    SERVICE      │
└──────┬──────────┘
       │
       │ (mapped skills)
       │
┌──────▼──────────────┐
│ SERVICE_PROVIDER    │
└──────┬──────────────┘
       │
       │ 1
       │
       │ n
┌──────▼──────────┐
│  AVAILABILITY   │
└─────────────────┘
       │
       │ 1
       │
       │ n
┌──────▼──────────┐
│    BOOKING      │
└──────┬──────────┘
       │
       │ 1
       │
       │ n
┌──────▼──────────┐
│     JOB         │
└──────┬──────────┘
       │
       │ 1
       │
       │ 1
┌──────▼──────────┐
│   PAYMENT       │
└─────────────────┘
       │
       │ 1
       │
       │ n
┌──────▼──────────┐
│    REVIEW       │
└─────────────────┘

🔑 COLLECTION ROLES (SHORT & CLEAR)
1️⃣ categories

Top-level grouping
Example: AC Services, Plumbing, Salon at Home

2️⃣ subcategories

Specific service types
Example: AC Repair, AC Installation

3️⃣ services

Actual bookable services
Example: Split AC Gas Refill – ₹599

4️⃣ service_providers

Core provider account

Key links:

skills → services._id

status → approved / pending / blocked

5️⃣ availability

Tracks:

online / offline

working hours

blocked dates

6️⃣ bookings

Created by users
Before provider assignment

Status:

pending

provider_assigned

cancelled

7️⃣ jobs

Provider-facing execution entity
Created after provider accepts booking

Status:

accepted

in_progress

completed

8️⃣ payments

Linked to job

service charge

spare parts

commission

payout

9️⃣ reviews

User feedback for provider

rating

comment

affects provider score

🔁 REAL FLOW (FROM DB POV)
User books service
→ booking created
→ system finds matching provider
→ job created
→ provider accepts
→ job completed
→ payment settled
→ review added
→ provider rating updated

🧠 IMPORTANT DESIGN DECISION (VERY GOOD PRACTICE)

❌ Do NOT overload booking

✅ Separate job collection

Reason:

Booking = user intent

Job = provider execution

This keeps logic clean and scalable.