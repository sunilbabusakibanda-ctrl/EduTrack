HttpRequest req = new HttpRequest();
req.setEndpoint(Url.getOrgDomainUrl().toExternalForm() + '/services/data/v65.0/tooling/sobjects/RecordType/012f6000000zlDJAAY');
req.setMethod('PATCH');
req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionId());
req.setHeader('Content-Type', 'application/json');
// The Tooling API requires 'Metadata' field for certain updates
req.setBody('{"FullName":"Account.OldPA", "Metadata":{"label":"Old PA", "active":true}}');

Http http = new Http();
HttpResponse res = http.send(req);
System.debug('Status: ' + res.getStatusCode());
System.debug('Body: ' + res.getBody());
