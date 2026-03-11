for (RecordType rt : [SELECT Id, Name, DeveloperName, SobjectType, IsPersonType, NamespacePrefix FROM RecordType WHERE SobjectType = 'Account']) {
    System.debug(rt.Id + ' | Name: ' + rt.Name + ' | DevName: ' + rt.DeveloperName + ' | IsPersonType: ' + rt.IsPersonType + ' | Namespace: ' + rt.NamespacePrefix);
}
