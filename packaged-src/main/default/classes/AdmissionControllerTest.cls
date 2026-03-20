@isTest
public class AdmissionControllerTest {

    public class MockHttpResponseGenerator implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'image/png');
            res.setBodyAsBlob(Blob.valueOf('test image'));
            res.setStatusCode(200);
            return res;
        }
    }

    @testSetup
    static void setup() {
        Academic_Year__c ay = new Academic_Year__c(
            Name = '2025-2026', 
            Is_Active__c = true,
            Start_Date__c = Date.today(),
            End_Date__c = Date.today().addDays(365)
        );
        insert ay;
        
        Id personAccountRecordTypeId = [SELECT Id FROM RecordType WHERE SobjectType='Account' AND IsPersonType=true LIMIT 1].Id;
        Account acc = new Account(FirstName='Test', LastName='Student', RecordTypeId=personAccountRecordTypeId);
        insert acc;
        
        Opportunity opp = new Opportunity(Name='Test Opp', AccountId=acc.Id, StageName='Prospecting', CloseDate=Date.today());
        insert opp;
        
        Product2 prod = new Product2(Name='Fee', Family='Fee', IsActive=true);
        insert prod;
        Id stdPbId = Test.getStandardPricebookId();
        PricebookEntry pbe = new PricebookEntry(Pricebook2Id=stdPbId, Product2Id=prod.Id, UnitPrice=100, IsActive=true);
        insert pbe;
        
        OpportunityLineItem oli = new OpportunityLineItem(OpportunityId=opp.Id, PricebookEntryId=pbe.Id, Quantity=1, UnitPrice=100);
        insert oli;
        
        Invoice__c inv = new Invoice__c(Opportunity__c=opp.Id, Student__c=acc.Id, Status__c='Paid');
        insert inv;
        Invoice_Item__c invItem = new Invoice_Item__c(Invoice__c=inv.Id, Opportunity_Line_Item_Id__c=oli.Id, Amount__c=50);
        insert invItem;
        
        String validClass = 'Class-1';
        Pricebook2 customPb = new Pricebook2(Name='Class 1', IsActive=true, Academic_Year__c=ay.Id);
        insert customPb;
        insert new PricebookEntry(Pricebook2Id=customPb.Id, Product2Id=prod.Id, UnitPrice=100, IsActive=true);
    }
    
    @isTest
    static void testGetActiveProducts() {
        Academic_Year__c ay = [SELECT Id FROM Academic_Year__c LIMIT 1];
        List<PricebookEntry> pbes = AdmissionController.getActiveProducts('Class-1', ay.Id);
        Assert.isFalse(pbes.isEmpty(), 'Should return active products');
        
        pbes = AdmissionController.getActiveProducts('', ay.Id);
        Assert.isTrue(pbes.isEmpty(), 'Should return empty for blank class');
    }
    
    @isTest
    static void testCreateAdmission() {
        Academic_Year__c ay = [SELECT Id FROM Academic_Year__c LIMIT 1];
        PricebookEntry pbe = [SELECT Id FROM PricebookEntry WHERE Pricebook2.Name = 'Class 1' LIMIT 1];
        
        Map<String, String> data = new Map<String, String>{
            'firstName' => 'New',
            'lastName' => 'Student',
            'email' => 'new@test.com',
            'phone' => '1234567890',
            'dob' => '2015-01-01',
            'selectedClass' => 'Class-1',
            'academicYear' => ay.Id,
            'fatherName' => 'Father',
            'motherName' => 'Mother'
        };
        
        Map<String, Object> result = AdmissionController.createAdmission(data, new List<Id>{pbe.Id}, 10.0);
        Assert.isTrue((Boolean)result.get('success'), 'Admission should be created successfully');
    }
    
    @isTest
    static void testGetOptions() {
        AdmissionController.getAcademicYearOptions();
        AdmissionController.getClassOptions();
        AdmissionController.getAdmissionPicklistValues();
        AdmissionController.getAdmissionCSVTemplate();
    }
    
    @isTest
    static void testSearchAndGetStudent() {
        Account acc = [SELECT Id FROM Account LIMIT 1];
        AdmissionController.searchStudents('Test', (Double)1.0);
        AdmissionController.getStudentById(acc.Id, (Double)1.0);
    }
    
    @isTest
    static void testInvoiceAndFees() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        Account acc = [SELECT Id FROM Account LIMIT 1];
        OpportunityLineItem oli = [SELECT Id, Product2Id FROM OpportunityLineItem LIMIT 1];
        Invoice__c inv = [SELECT Id FROM Invoice__c LIMIT 1];
        
        AdmissionController.getUnpaidFees(opp.Id);
        AdmissionController.getInvoicePDFUrl(inv.Id);
        
        List<Map<String, Object>> items = new List<Map<String, Object>>{
            new Map<String, Object>{'oliId' => (String)oli.Id, 'productId' => oli.Product2Id, 'amount' => 50}
        };
        
        Map<String, String> bankDetails = new Map<String, String>{
            'bankName' => 'SBI',
            'bankIfsc' => 'SBIN001',
            'bankAccountNumber' => '999',
            'bankBranch' => 'City'
        };
        
        Id newInvId = AdmissionController.createInvoice(opp.Id, acc.Id, items, 'Net Banking', bankDetails);
        
        Invoice__c savedInv = [SELECT Bank_Name__c, Bank_IFSC__c FROM Invoice__c WHERE Id = :newInvId];
        Assert.areEqual('SBI', savedInv.Bank_Name__c, 'Bank name should be saved');
        AdmissionController.getRecentInvoices(acc.Id);
        AdmissionController.voidInvoice(newInvId);
    }
    
    @isTest
    static void testQRCode() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        AdmissionController.getQRCodeBase64('http://example.com/qr');
        Test.stopTest();
    }
    
    @isTest
    static void testDiscounts() {
        OpportunityLineItem oli = [SELECT Id FROM OpportunityLineItem LIMIT 1];
        AdmissionController.updateLineItemDiscount(oli.Id, 10);
        AdmissionController.updateBulkLineItemDiscounts(new List<String>{oli.Id}, 20);
    }

    @isTest
    static void testImportStudentsBulk() {
        Academic_Year__c ay = [SELECT Name FROM Academic_Year__c LIMIT 1];
        
        List<Map<String, String>> importData = new List<Map<String, String>>();
        importData.add(new Map<String, String>{
            'First Name' => 'John',
            'Last Name' => 'Doe',
            'Email' => 'john@doe.com',
            'Phone' => '9999999999',
            'DOB' => '15-06-2015',
            'Class' => 'Class-1',
            'Academic Year' => ay.Name
        });
        importData.add(new Map<String, String>{
            'First Name' => 'Jane',
            'Last Name' => 'Smith',
            'Email' => 'jane@smith.com',
            'Phone' => '8888888888',
            'DOB' => '2016/07/20',
            'Class' => 'Class-1',
            'Academic Year' => ay.Name
        });

        Test.startTest();
        Map<String, Object> result = AdmissionController.importStudentsBulk(importData);
        Test.stopTest();

        Assert.areEqual(2, result.get('successCount'), 'Both students should be imported');
    }
}