HttpRequest req = new HttpRequest();
req.setEndpoint(Url.getOrgDomainUrl().toExternalForm() + '/services/data/v65.0/tooling/sobjects/RecordType/012f6000000zlDJAAY');
req.setMethod('PATCH');
req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId());
req.setHeader('Content-Type', 'application/json');
// Deactivate OldPA
req.setBody('{"Metadata":{"active":false, "label":"Old PA", "description":"Deactivated duplicate"}}');

Http http = new Http();
HttpResponse res = http.send(req);
System.debug('Status: ' + res.getStatusCode());
System.debug('Body: ' + res.getBody());
