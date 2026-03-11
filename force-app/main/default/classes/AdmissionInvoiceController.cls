public without sharing class AdmissionInvoiceController {
    public Invoice__c invoice { get; set; }
    public List<Invoice_Item__c> invoiceItems { get; set; }
    public Decimal totalAmount { get; set; }
    public String academicYearName { get; set; }
    public String schoolName { get; private set; }
    public String schoolAddress { get; private set; }
    public String schoolPhone { get; private set; }
    public String schoolLogo { get; private set; }
    public String schoolSubtitle { get; private set; }

    public AdmissionInvoiceController() {
        invoice = new Invoice__c();
        invoiceItems = new List<Invoice_Item__c>();
        totalAmount = 0;

        // Fetch School Details from Custom Setting
        School_Setup__c setup = School_Setup__c.getOrgDefaults();
        schoolName = String.isNotBlank(setup.School_Name__c) ? setup.School_Name__c : 'EDU PRO SYSTEM';
        schoolAddress = String.isNotBlank(setup.School_Address__c) ? setup.School_Address__c : 'School Campus Address';
        schoolPhone = String.isNotBlank(setup.School_Phone__c) ? setup.School_Phone__c : '+91 999 999 9999';
        schoolLogo = setup.School_Logo__c;
        schoolSubtitle = String.isNotBlank(setup.School_Subtitle__c) ? setup.School_Subtitle__c : 'Powered by Salesforce';

        Map<String, String> params = ApexPages.currentPage().getParameters();
        Id invoiceId = params.get('id');
        if (invoiceId == null) invoiceId = params.get('invoiceId');
        if (invoiceId == null) invoiceId = params.get('c__id');
        if (invoiceId == null) invoiceId = params.get('c__invoiceId');
        
        if (invoiceId != null) {
            List<Invoice__c> invs = [
                SELECT Name, Invoice_Date__c, Student__r.Name, Opportunity__r.Name,
                       Student__r.Father_Name__c, Student__r.Mother_Name__c, Student__r.PersonBirthdate,
                       Student__r.Village__c, Student__r.PersonMailingCity, 
                       Student__r.PersonMailingPostalCode, Student__r.State__c, 
                       Student__r.Country__c, Student__r.Nationality__c, Student__r.Roll_No__c,
                       Opportunity__r.Class__c, Opportunity__r.Section__c, Opportunity__r.Academic_Year__c 
                FROM Invoice__c 
                WHERE Id = :invoiceId 
                LIMIT 1
            ];
            if (!invs.isEmpty()) {
                invoice = invs[0];
                invoiceItems = [
                    SELECT Product__r.Name, Amount__c 
                    FROM Invoice_Item__c 
                    WHERE Invoice__c = :invoiceId
                ];
                
                // totalAmount is already initialized to 0 at the beginning of the constructor.
                // If invoice items are found, we calculate the sum.
                // If no items are found, totalAmount remains 0.
                for (Invoice_Item__c item : invoiceItems) {
                    totalAmount += (item.Amount__c != null ? item.Amount__c : 0);
                }

                // Resolve Academic Year Name
                resolveAcademicYearName();
            }
        }
    }

    private void resolveAcademicYearName() {
        if (invoice.Opportunity__r != null && String.isNotBlank(invoice.Opportunity__r.Academic_Year__c)) {
            academicYearName = invoice.Opportunity__r.Academic_Year__c;
            try {
                // Try to resolve as ID if it looks like one, otherwise keep as is
                if (academicYearName instanceof Id || (academicYearName.length() >= 15 && !academicYearName.contains(' '))) {
                    List<Academic_Year__c> ay = [SELECT Name FROM Academic_Year__c WHERE Id = :academicYearName LIMIT 1];
                    if (!ay.isEmpty()) {
                        academicYearName = ay[0].Name;
                    }
                }
            } catch (Exception e) {
                System.debug('Error resolving academic year name: ' + e.getMessage());
            }
        }
    }
}