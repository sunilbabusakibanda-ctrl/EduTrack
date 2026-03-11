List<ApexLog> logs = [SELECT Id, Request, Operation, StartTime, LogLength FROM ApexLog WHERE Operation LIKE '%aura%' ORDER BY StartTime DESC LIMIT 3];
for(ApexLog l : logs) {
    System.debug('LOG ID: ' + l.Id + ' | Start: ' + l.StartTime);
}
