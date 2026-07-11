// ── Transaction Data ──────────────────────────────────────────────────────────
// 150 realistic company transactions across April–June 2026.
// Anomalies are marked with inline comments (🚨) for reference;
// the analyzer detects them purely from the data.

const T = (id, date, vendor, category, amount, department, approvedBy, description) => ({
  id, date, vendor, category, amount,
  department, approved_by: approvedBy, description
});

const TRANSACTIONS = [

  // ══════════════════════════════════════════════════════
  // APRIL 2026 — Monthly subscriptions (Apr 1)
  // ══════════════════════════════════════════════════════
  T('TXN-00001','2026-04-01','WeWork','Facilities',3500.00,'Operations','Michael Torres','Monthly office space lease – April 2026'),
  T('TXN-00002','2026-04-01','Salesforce','CRM Software',1500.00,'Sales','David Kim','Salesforce Professional licenses – April'),
  T('TXN-00003','2026-04-01','Adobe Systems','Design Software',52.99,'Engineering','Jennifer Walsh','Adobe Creative Cloud subscription – April'),
  T('TXN-00004','2026-04-01','Zoom','Video Conferencing',149.90,'Operations','Michael Torres','Zoom Business plan – April'),
  T('TXN-00005','2026-04-01','Slack','Communication',87.50,'Engineering','Jennifer Walsh','Slack Pro subscription – April'),
  T('TXN-00006','2026-04-01','GitHub','Code Repository',42.00,'Engineering','Jennifer Walsh','GitHub Teams – April'),
  T('TXN-00007','2026-04-01','Grammarly Business','Productivity',25.00,'Marketing','Amanda Foster','Grammarly Business license – April'),
  T('TXN-00008','2026-04-01','Microsoft 365','Productivity Suite',150.00,'Operations','Michael Torres','Microsoft 365 Business – April'),
  T('TXN-00009','2026-04-01','HubSpot','CRM Software',800.00,'Marketing','Amanda Foster','HubSpot Marketing Hub – April'),
  T('TXN-00010','2026-04-01','Notion','Project Management',32.00,'Engineering','Jennifer Walsh','Notion Team plan – April'),
  T('TXN-00011','2026-04-01','Figma','Design Software',75.00,'Engineering','Jennifer Walsh','Figma Professional – April'),
  T('TXN-00012','2026-04-01','Atlassian','Project Management',300.00,'Engineering','Jennifer Walsh','Jira + Confluence licenses – April'),
  T('TXN-00013','2026-04-01','Gusto','HR Software',50.00,'HR','Sarah Chen','Gusto payroll processing – April'),
  T('TXN-00014','2026-04-01','QuickBooks','Accounting',70.00,'Finance','Robert Hayes','QuickBooks Online – April'),
  T('TXN-00015','2026-04-01','Mailchimp','Email Marketing',110.00,'Marketing','Amanda Foster','Mailchimp Standard plan – April'),
  T('TXN-00016','2026-04-01','Google Workspace','Productivity Suite',180.00,'Operations','Michael Torres','Google Workspace Business – April'),
  T('TXN-00017','2026-04-01','LinkedIn Premium','Recruiting',99.99,'HR','Sarah Chen','LinkedIn Recruiter licenses – April'),
  T('TXN-00018','2026-04-01','Dropbox Business','Cloud Storage',20.00,'Engineering','Jennifer Walsh','Dropbox Business plan – April'),
  T('TXN-00019','2026-04-01','DocuSign','Document Management',40.00,'Finance','Robert Hayes','DocuSign Business Pro – April'),
  T('TXN-00020','2026-04-01','Canva Pro','Design Software',16.00,'Marketing','Amanda Foster','Canva Pro subscription – April'),

  // April — variable charges
  T('TXN-00021','2026-04-03','AWS','Cloud Services',1245.80,'Engineering','Jennifer Walsh','EC2 instances + S3 storage – Apr W1'),
  T('TXN-00022','2026-04-04','FedEx','Shipping',87.50,'Operations','Michael Torres','Expedited shipping – client materials'),
  T('TXN-00023','2026-04-05','Best Buy Business','Equipment',1245.00,'Engineering','Jennifer Walsh','Dell monitors – dev team expansion'),
  T('TXN-00024','2026-04-07','Uber for Business','Travel',45.20,'Sales','David Kim','Client meeting – downtown transport'),
  T('TXN-00025','2026-04-08','Starbucks Business','Meals',127.40,'Operations','Michael Torres','Weekly standup coffee – team of 14'),
  T('TXN-00026','2026-04-08','Costco Business','Office Supplies',189.90,'Operations','Michael Torres','Breakroom restock – snacks & supplies'),
  T('TXN-00027','2026-04-09','Amazon Business','Office Supplies',234.99,'Operations','Michael Torres','Office supplies bulk order'),
  T('TXN-00028','2026-04-10','Delta Airlines','Travel',567.00,'Sales','David Kim','NYC client visit – return flight'),
  T('TXN-00029','2026-04-12','FedEx','Shipping',134.20,'Operations','Michael Torres','Document shipping – contract execution'),
  T('TXN-00030','2026-04-12','The Capital Grille','Meals',487.30,'Operations','Michael Torres','Team lunch – quarterly kickoff'),
  T('TXN-00031','2026-04-14','Uber for Business','Travel',32.10,'Marketing','Amanda Foster','Conference transport'),
  T('TXN-00032','2026-04-15','Costco Business','Office Supplies',289.50,'Operations','Michael Torres','Breakroom supplies – monthly'),
  T('TXN-00033','2026-04-17','Office Depot','Office Supplies',312.40,'Operations','Michael Torres','Printer paper and toner – Q2 stock'),
  T('TXN-00034','2026-04-18','AWS','Cloud Services',1389.20,'Engineering','Jennifer Walsh','Lambda + CloudFront charges – Apr W3'),
  T('TXN-00035','2026-04-18','Marriott Hotels','Travel',389.00,'Sales','David Kim','Overnight stay – Boston client meeting'),
  T('TXN-00036','2026-04-20','Chipotle Corporate','Meals',156.80,'Engineering','Jennifer Walsh','Sprint planning lunch'),
  T('TXN-00037','2026-04-21','Uber for Business','Travel',78.90,'Sales','David Kim','Airport pickup – visiting executive'),
  T('TXN-00038','2026-04-21','Amazon Business','Office Supplies',89.40,'HR','Sarah Chen','HR onboarding supplies – 3 new hires'),
  T('TXN-00039','2026-04-22','Delta Airlines','Travel',423.00,'Marketing','Amanda Foster','Marketing conference – Chicago'),
  T('TXN-00040','2026-04-23','Stripe','Payment Processing',245.80,'Finance','Robert Hayes','Transaction processing fees – Apr mid'),
  T('TXN-00041','2026-04-24','FedEx','Shipping',95.60,'Operations','Michael Torres','Hardware return shipping'),
  T('TXN-00042','2026-04-24','Uber for Business','Travel',56.30,'Sales','David Kim','Sales team offsite transport'),
  T('TXN-00043','2026-04-25','Staples','Office Supplies',198.40,'Operations','Michael Torres','Ergonomic desk accessories'),
  T('TXN-00044','2026-04-26','Starbucks Business','Meals',143.20,'Operations','Michael Torres','Weekly all-hands coffee'),
  T('TXN-00045','2026-04-26','FedEx','Shipping',112.40,'Operations','Michael Torres','Outbound – product demo materials'),
  T('TXN-00046','2026-04-28','AWS','Cloud Services',1178.50,'Engineering','Jennifer Walsh','Database backups + data transfer – Apr W4'),
  T('TXN-00047','2026-04-29','Office Depot','Office Supplies',267.80,'Operations','Michael Torres','Desk accessories and labels'),
  T('TXN-00048','2026-04-30','Eventbrite','Events',299.00,'Marketing','Amanda Foster','SaaS Metrics Summit registration'),
  T('TXN-00049','2026-04-30','Stripe','Payment Processing',312.40,'Finance','Robert Hayes','Transaction processing fees – Apr end'),
  T('TXN-00050','2026-04-16','Starbucks Business','Meals',89.30,'Engineering','Jennifer Walsh','Engineering team meeting coffee'),

  // ══════════════════════════════════════════════════════
  // MAY 2026 — Monthly subscriptions (May 1)
  // ══════════════════════════════════════════════════════
  T('TXN-00051','2026-05-01','WeWork','Facilities',3500.00,'Operations','Michael Torres','Monthly office space lease – May 2026'),
  T('TXN-00052','2026-05-01','Salesforce','CRM Software',1500.00,'Sales','David Kim','Salesforce Professional licenses – May'),
  T('TXN-00053','2026-05-01','Adobe Systems','Design Software',52.99,'Engineering','Jennifer Walsh','Adobe Creative Cloud subscription – May'),
  T('TXN-00054','2026-05-01','Zoom','Video Conferencing',149.90,'Operations','Michael Torres','Zoom Business plan – May'),
  T('TXN-00055','2026-05-01','Slack','Communication',87.50,'Engineering','Jennifer Walsh','Slack Pro subscription – May'),
  T('TXN-00056','2026-05-01','GitHub','Code Repository',42.00,'Engineering','Jennifer Walsh','GitHub Teams – May'),
  T('TXN-00057','2026-05-01','Grammarly Business','Productivity',25.00,'Marketing','Amanda Foster','Grammarly Business license – May'),
  T('TXN-00058','2026-05-01','Microsoft 365','Productivity Suite',150.00,'Operations','Michael Torres','Microsoft 365 Business – May'),
  T('TXN-00059','2026-05-01','HubSpot','CRM Software',800.00,'Marketing','Amanda Foster','HubSpot Marketing Hub – May'),
  T('TXN-00060','2026-05-01','Notion','Project Management',32.00,'Engineering','Jennifer Walsh','Notion Team plan – May'),
  T('TXN-00061','2026-05-01','Figma','Design Software',75.00,'Engineering','Jennifer Walsh','Figma Professional – May'),
  T('TXN-00062','2026-05-01','Atlassian','Project Management',300.00,'Engineering','Jennifer Walsh','Jira + Confluence licenses – May'),
  T('TXN-00063','2026-05-01','Gusto','HR Software',50.00,'HR','Sarah Chen','Gusto payroll processing – May'),
  T('TXN-00064','2026-05-01','QuickBooks','Accounting',70.00,'Finance','Robert Hayes','QuickBooks Online – May'),
  T('TXN-00065','2026-05-01','Mailchimp','Email Marketing',110.00,'Marketing','Amanda Foster','Mailchimp Standard plan – May'),
  T('TXN-00066','2026-05-01','Google Workspace','Productivity Suite',180.00,'Operations','Michael Torres','Google Workspace Business – May'),
  T('TXN-00067','2026-05-01','LinkedIn Premium','Recruiting',99.99,'HR','Sarah Chen','LinkedIn Recruiter licenses – May'),
  T('TXN-00068','2026-05-01','Dropbox Business','Cloud Storage',20.00,'Engineering','Jennifer Walsh','Dropbox Business plan – May'),
  T('TXN-00069','2026-05-01','DocuSign','Document Management',40.00,'Finance','Robert Hayes','DocuSign Business Pro – May'),
  T('TXN-00070','2026-05-01','Canva Pro','Design Software',16.00,'Marketing','Amanda Foster','Canva Pro subscription – May'),

  // May — variable charges
  T('TXN-00071','2026-05-02','FedEx','Shipping',78.90,'Operations','Michael Torres','Sample kit shipping – prospect'),
  T('TXN-00072','2026-05-03','Uber for Business','Travel',43.50,'Sales','David Kim','Client dinner transport'),
  T('TXN-00073','2026-05-04','Chipotle Corporate','Meals',134.20,'Engineering','Jennifer Walsh','Friday team lunch'),
  T('TXN-00074','2026-05-05','AWS','Cloud Services',1456.30,'Engineering','Jennifer Walsh','EC2 + RDS charges – May W1'),
  T('TXN-00075','2026-05-06','Starbucks Business','Meals',112.40,'Operations','Michael Torres','Weekly all-hands coffee'),
  T('TXN-00076','2026-05-07','Amazon Business','Office Supplies',345.60,'Operations','Michael Torres','Bulk office supplies reorder'),
  T('TXN-00077','2026-05-08','Delta Airlines','Travel',789.00,'Sales','David Kim','San Francisco – investor meeting'),
  T('TXN-00078','2026-05-09','FedEx','Shipping',99.40,'Operations','Michael Torres','Contract delivery – overnight'),
  T('TXN-00079','2026-05-10','Uber for Business','Travel',67.80,'Marketing','Amanda Foster','Airport – trade show travel'),
  T('TXN-00080','2026-05-11','Best Buy Business','Equipment',789.50,'Engineering','Jennifer Walsh','USB-C hub and peripherals'),
  T('TXN-00081','2026-05-12','Costco Business','Office Supplies',312.40,'Operations','Michael Torres','Monthly breakroom + supplies'),
  T('TXN-00082','2026-05-13','Office Depot','Office Supplies',234.50,'Operations','Michael Torres','A4 paper + filing supplies'),
  T('TXN-00083','2026-05-14','AWS','Cloud Services',1324.80,'Engineering','Jennifer Walsh','CloudWatch + data transfer – May W2'),
  T('TXN-00084','2026-05-15','Starbucks Business','Meals',98.70,'Operations','Michael Torres','Mid-month team standup coffee'),
  T('TXN-00085','2026-05-16','Marriott Hotels','Travel',456.00,'Sales','David Kim','2-night stay – Chicago sales trip'),
  T('TXN-00086','2026-05-17','Uber for Business','Travel',34.20,'Sales','David Kim','Hotel to client office'),
  T('TXN-00087','2026-05-18','Eventbrite','Events',149.00,'Marketing','Amanda Foster','Growth Hacking Summit ticket'),
  T('TXN-00088','2026-05-19','FedEx','Shipping',87.30,'Operations','Michael Torres','Return label – vendor equipment'),
  T('TXN-00089','2026-05-20','Delta Airlines','Travel',534.00,'Marketing','Amanda Foster','Return flight – trade show'),
  T('TXN-00090','2026-05-21','Amazon Business','Office Supplies',178.90,'Engineering','Jennifer Walsh','Cables and desk accessories'),
  T('TXN-00091','2026-05-22','Stripe','Payment Processing',289.40,'Finance','Robert Hayes','Payment processing fees – May mid'),
  T('TXN-00092','2026-05-23','Starbucks Business','Meals',134.50,'Engineering','Jennifer Walsh','Engineering all-hands coffee'),
  T('TXN-00093','2026-05-24','FedEx','Shipping',145.20,'Operations','Michael Torres','Outbound – customer hardware'),
  T('TXN-00094','2026-05-25','Staples','Office Supplies',189.40,'Operations','Michael Torres','Sticky notes, pens, folders'),
  T('TXN-00095','2026-05-26','AWS','Cloud Services',1289.60,'Engineering','Jennifer Walsh','S3 + CloudFront – May W4'),
  T('TXN-00096','2026-05-27','Office Depot','Office Supplies',298.70,'Operations','Michael Torres','Toner + presentation supplies'),
  T('TXN-00097','2026-05-28','Stripe','Payment Processing',334.20,'Finance','Robert Hayes','Payment processing fees – May end'),
  T('TXN-00098','2026-05-29','Uber for Business','Travel',52.40,'Sales','David Kim','End-of-month client transport'),
  T('TXN-00099','2026-05-30','The Capital Grille','Meals',524.80,'Operations','Michael Torres','Monthly team appreciation dinner'),
  T('TXN-00100','2026-05-31','Starbucks Business','Meals',76.30,'Operations','Michael Torres','Month-end team standup coffee'),

  // ══════════════════════════════════════════════════════
  // JUNE 2026 — Monthly subscriptions (Jun 1)
  // ══════════════════════════════════════════════════════
  // 🚨 ANOMALY: WeWork price spike — $5,200 vs historical avg $3,500 (+48.6%)
  T('TXN-00101','2026-06-01','WeWork','Facilities',5200.00,'Operations','Michael Torres','Monthly office space lease – June 2026'),
  T('TXN-00102','2026-06-01','Salesforce','CRM Software',1500.00,'Sales','David Kim','Salesforce Professional licenses – June'),
  T('TXN-00103','2026-06-01','Adobe Systems','Design Software',52.99,'Engineering','Jennifer Walsh','Adobe Creative Cloud subscription – June'),
  T('TXN-00104','2026-06-01','Zoom','Video Conferencing',149.90,'Operations','Michael Torres','Zoom Business plan – June'),
  T('TXN-00105','2026-06-01','Slack','Communication',87.50,'Engineering','Jennifer Walsh','Slack Pro subscription – June'),
  T('TXN-00106','2026-06-01','GitHub','Code Repository',42.00,'Engineering','Jennifer Walsh','GitHub Teams – June'),
  T('TXN-00107','2026-06-01','Grammarly Business','Productivity',25.00,'Marketing','Amanda Foster','Grammarly Business license – June'),
  T('TXN-00108','2026-06-01','Microsoft 365','Productivity Suite',150.00,'Operations','Michael Torres','Microsoft 365 Business – June'),
  T('TXN-00109','2026-06-01','HubSpot','CRM Software',800.00,'Marketing','Amanda Foster','HubSpot Marketing Hub – June'),
  T('TXN-00110','2026-06-01','Notion','Project Management',32.00,'Engineering','Jennifer Walsh','Notion Team plan – June'),
  T('TXN-00111','2026-06-01','Figma','Design Software',75.00,'Engineering','Jennifer Walsh','Figma Professional – June'),
  T('TXN-00112','2026-06-01','Atlassian','Project Management',300.00,'Engineering','Jennifer Walsh','Jira + Confluence licenses – June'),
  T('TXN-00113','2026-06-01','Gusto','HR Software',50.00,'HR','Sarah Chen','Gusto payroll processing – June'),
  T('TXN-00114','2026-06-01','QuickBooks','Accounting',70.00,'Finance','Robert Hayes','QuickBooks Online – June'),
  T('TXN-00115','2026-06-01','Mailchimp','Email Marketing',110.00,'Marketing','Amanda Foster','Mailchimp Standard plan – June'),
  T('TXN-00116','2026-06-01','Google Workspace','Productivity Suite',180.00,'Operations','Michael Torres','Google Workspace Business – June'),
  T('TXN-00117','2026-06-01','LinkedIn Premium','Recruiting',99.99,'HR','Sarah Chen','LinkedIn Recruiter licenses – June'),
  T('TXN-00118','2026-06-01','Dropbox Business','Cloud Storage',20.00,'Engineering','Jennifer Walsh','Dropbox Business plan – June'),
  T('TXN-00119','2026-06-01','DocuSign','Document Management',40.00,'Finance','Robert Hayes','DocuSign Business Pro – June'),
  T('TXN-00120','2026-06-01','Canva Pro','Design Software',16.00,'Marketing','Amanda Foster','Canva Pro subscription – June'),

  // June — variable charges
  T('TXN-00121','2026-06-02','FedEx','Shipping',89.40,'Operations','Michael Torres','Sample kit shipping – new prospect'),
  // 🚨 ANOMALY: Duplicate Adobe charge — same amount $52.99, 2 days after TXN-00103
  T('TXN-00122','2026-06-03','Adobe Systems','Design Software',52.99,'Engineering','Jennifer Walsh','Adobe Creative Cloud – billing correction'),
  // 🚨 ANOMALY: Duplicate Salesforce charge — same amount $1,500, 3 days after TXN-00102
  T('TXN-00123','2026-06-04','Salesforce','CRM Software',1500.00,'Sales','David Kim','Salesforce – additional seat invoice'),
  T('TXN-00124','2026-06-05','AWS','Cloud Services',1345.70,'Engineering','Jennifer Walsh','EC2 + RDS charges – Jun W1'),
  T('TXN-00125','2026-06-05','Uber for Business','Travel',61.20,'Sales','David Kim','Client dinner – downtown'),
  T('TXN-00126','2026-06-06','Starbucks Business','Meals',123.40,'Operations','Michael Torres','Weekly standup coffee'),
  // 🚨 ANOMALY: Duplicate FedEx charge — same amount $89.40, 5 days after TXN-00121
  T('TXN-00127','2026-06-07','FedEx','Shipping',89.40,'Operations','Michael Torres','Sample kit shipping – follow-up'),
  // 🚨 ANOMALY: Unusual vendor — no prior history, $3,750 marketing spend with no contract on record
  T('TXN-00128','2026-06-08','Pinnacle Marketing Solutions LLC','Marketing',3750.00,'Marketing','Amanda Foster','Q2 digital advertising campaign management'),
  T('TXN-00129','2026-06-09','Amazon Business','Office Supplies',234.50,'Operations','Michael Torres','Office supplies restock'),
  // 🚨 ANOMALY: Office Depot price spike — $534.20 vs historical avg ~$278 (+91.9%)
  T('TXN-00130','2026-06-10','Office Depot','Office Supplies',534.20,'Operations','Michael Torres','Office furniture assembly + supplies'),
  // 🚨 ANOMALY: AWS price spike — $2,089.40 vs historical avg ~$1,314 (+59.0%)
  T('TXN-00131','2026-06-11','AWS','Cloud Services',2089.40,'Engineering','Jennifer Walsh','EC2 scale-up + data egress – Jun W2'),
  T('TXN-00132','2026-06-12','Uber for Business','Travel',45.30,'Sales','David Kim','Client site visit'),
  T('TXN-00133','2026-06-13','Starbucks Business','Meals',89.40,'Engineering','Jennifer Walsh','Engineering team coffee'),
  T('TXN-00134','2026-06-14','Delta Airlines','Travel',678.00,'Sales','David Kim','Sales conference – Austin TX'),
  // 🚨 ANOMALY: Unusual vendor + suspicious round amount — $5,000.00 exactly, first-time vendor
  T('TXN-00135','2026-06-15','TechVault Innovations','Technology',5000.00,'Engineering','Jennifer Walsh','Software licensing and consulting services'),
  T('TXN-00136','2026-06-16','Marriott Hotels','Travel',523.00,'Sales','David Kim','2-night stay – Austin conference'),
  T('TXN-00137','2026-06-17','FedEx','Shipping',112.30,'Operations','Michael Torres','Client deliverables – overnight'),
  T('TXN-00138','2026-06-18','Stripe','Payment Processing',267.80,'Finance','Robert Hayes','Payment processing fees – Jun mid'),
  T('TXN-00139','2026-06-19','Uber for Business','Travel',38.90,'Sales','David Kim','Airport pickup'),
  T('TXN-00140','2026-06-20','Starbucks Business','Meals',156.70,'Operations','Michael Torres','Monthly team coffee budget'),
  T('TXN-00141','2026-06-21','Amazon Business','Office Supplies',189.40,'Operations','Michael Torres','Miscellaneous office supplies'),
  T('TXN-00142','2026-06-22','Costco Business','Office Supplies',345.60,'Operations','Michael Torres','Quarterly bulk supplies run'),
  T('TXN-00143','2026-06-23','Delta Airlines','Travel',892.00,'Sales','David Kim','Return flight – Austin + layover'),
  T('TXN-00144','2026-06-24','Office Depot','Office Supplies',312.40,'Operations','Michael Torres','Toner and paper restock'),
  T('TXN-00145','2026-06-25','AWS','Cloud Services',1478.30,'Engineering','Jennifer Walsh','CloudFront + Lambda – Jun W4'),
  T('TXN-00146','2026-06-26','Stripe','Payment Processing',298.50,'Finance','Robert Hayes','Payment processing fees – Jun end'),
  T('TXN-00147','2026-06-27','Chipotle Corporate','Meals',145.30,'Engineering','Jennifer Walsh','Retrospective lunch'),
  T('TXN-00148','2026-06-28','FedEx','Shipping',98.70,'Operations','Michael Torres','End-of-quarter document delivery'),
  T('TXN-00149','2026-06-29','Uber for Business','Travel',72.40,'Sales','David Kim','Month-end client transport'),
  T('TXN-00150','2026-06-30','Staples','Office Supplies',234.80,'Operations','Michael Torres','Quarter-end stationery restock'),
];
