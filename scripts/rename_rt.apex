HttpRequest req = new HttpRequest();
req.setEndpoint(Url.getOrgDomainUrl().toExternalForm() + '/services/data/v65.0/tooling/sobjects/RecordType/012f6000000zlDJAAY');
req.setMethod('PATCH');
req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId());
req.setHeader('Content-Type', 'application/json');
// Updating DeveloperName and Name
req.setBody('{"FullName":"Account.FakePersonAccount", "Name":"Fake Person Account"}');

Http http = new Http();
HttpResponse res = http.send(req);
System.debug('Status: ' + res.getStatusCode());
System.debug('Body: ' + res.getBody());
