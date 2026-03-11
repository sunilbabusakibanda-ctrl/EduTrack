Id rtId = '012f6000000zlGXAAY'; // True Person Account RecordType

List<Account> newStudents = new List<Account>();
List<String> sections = new List<String>{'A', 'B', 'C', 'D', 'E'};

List<String> firstNames = new List<String>{
    'Aarav', 'Advik', 'Akash', 'Ananya', 'Arjun', 'Avni', 'Bhavya', 'Chaitanya', 'Ishaan', 'Kavya',
    'Kiara', 'Mansi', 'Myra', 'Nikhil', 'Pari', 'Pranav', 'Riya', 'Saanvi', 'Shaurya', 'Vihaan',
    'Zoya', 'Aditya', 'Aanya', 'Aryan', 'Diya', 'Eshan', 'Hiba', 'Kabir', 'Meher', 'Reyansh'
};

List<String> lastNames = new List<String>{
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Reddy', 'Mehta', 'Kumar', 'Kapoor', 'Iyer',
    'Khan', 'Das', 'Joshi', 'Dubey', 'Trivedi', 'Naidu', 'Choudhary', 'Rao', 'Bose', 'Malik'
};

List<String> fatherNames = new List<String>{
    'Rajesh', 'Suresh', 'Amit', 'Vikram', 'Anil', 'Sanjay', 'Manoj', 'Ravi', 'Deepak', 'Arun'
};

List<String> motherNames = new List<String>{
    'Sunita', 'Anita', 'Meena', 'Kavita', 'Pooja', 'Ritu', 'Seema', 'Geeta', 'Neelam', 'Rekha'
};

for (String sec : sections) {
    for (Integer i = 1; i <= 20; i++) {
        String fn = firstNames[Math.mod(Math.abs(Crypto.getRandomInteger()), firstNames.size())];
        String ln = lastNames[Math.mod(Math.abs(Crypto.getRandomInteger()), lastNames.size())];
        String father = fatherNames[Math.mod(Math.abs(Crypto.getRandomInteger()), fatherNames.size())];
        String mother = motherNames[Math.mod(Math.abs(Crypto.getRandomInteger()), motherNames.size())];
        
        Account a = new Account(
            RecordTypeId = rtId,
            FirstName = fn,
            LastName = ln,
            Father_Name__c = father + ' ' + ln,
            Mother_Name__c = mother + ' ' + ln,
            PersonMobilePhone = '9' + (String.valueOf(Math.abs(Crypto.getRandomInteger())).leftpad(9,'0')).substring(0, 9),
            PersonBirthdate = Date.newInstance(2021, Math.mod(i, 11) + 1, Math.mod(i, 27) + 1),
            Class__c = 'Nursery',
            Section__c = sec,
            Roll_No__c = 'NUR-' + sec + '-' + (i < 10 ? '0' + i : String.valueOf(i)),
            Type = 'Student',
            PersonEmail = fn.toLowerCase() + Crypto.getRandomInteger() + '@example.com',
            BillingStreet = 'Street ' + i + ', Block ' + sec,
            BillingCity = 'Hyderabad',
            BillingState = 'Telangana',
            BillingPostalCode = '500001',
            BillingCountry = 'India'
        );
        newStudents.add(a);
    }
}

insert newStudents;
System.debug('Successfully inserted ' + newStudents.size() + ' Nursery Person Accounts.');
