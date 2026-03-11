try {
    Id permSetId = [SELECT Id FROM PermissionSet WHERE Name = 'PersonAccountAccess' LIMIT 1].Id;
    Id rtId = '012f6000000zlGXAAY'; // The TRUE Person Account one
    
    SetupEntityAccess sea = new SetupEntityAccess(
        ParentId = permSetId,
        SetupEntityId = rtId
    );
    insert sea;
    System.debug('Successfully inserted SetupEntityAccess');
} catch (Exception e) {
    System.debug('Error: ' + e.getMessage());
}
