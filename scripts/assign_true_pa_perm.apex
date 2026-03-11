try {
    Id truePaId = '012f6000000zlGXAAY';
    
    // There isn't a direct DML way to set User Record Type preferences,
    // but I can create a new permission set specifically for the true PA
    // and assign it to myself, while removing the profile dependency.
    
    PermissionSet ps = new PermissionSet(
        Name = 'TruePA_Assign',
        Label = 'True Person Account Access'
    );
    insert ps;
    
    SetupEntityAccess sea = new SetupEntityAccess(
        ParentId = ps.Id,
        SetupEntityId = truePaId
    );
    insert sea;
    
    PermissionSetAssignment psa = new PermissionSetAssignment(
        AssigneeId = UserInfo.getUserId(),
        PermissionSetId = ps.Id
    );
    insert psa;
    
    System.debug('Successfully granted True PA via custom PermSet!');
} catch (Exception e) {
    System.debug('PermSet Error: ' + e.getMessage());
}
