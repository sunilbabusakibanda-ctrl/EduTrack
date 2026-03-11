List<Opportunity> oppsToUpdate = [
    SELECT Id, StageName 
    FROM Opportunity 
    WHERE Account.Type = 'Student'
    AND StageName = 'Closed Won'
    AND CreatedDate = TODAY
];

for(Opportunity opp : oppsToUpdate) {
    opp.StageName = 'Prospecting';
}

if (!oppsToUpdate.isEmpty()) {
    update oppsToUpdate;
    System.debug('Successfully updated ' + oppsToUpdate.size() + ' Opportunities to Prospecting.');
} else {
    System.debug('No Opportunities found to update.');
}
