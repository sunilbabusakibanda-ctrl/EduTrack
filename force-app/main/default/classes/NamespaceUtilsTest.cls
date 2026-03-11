@isTest
public class NamespaceUtilsTest {
    @isTest
    static void testStripNamespace() {
        Account acc = new Account(Name='Test');
        // Because we are in test mode and cannot easily mock a managed package namespace dynamically
        // on a standard field without inserting and querying (which still wouldn't have __c if not packaged),
        // we test the basic map iteration.
        
        Map<String, Object> result = NamespaceUtils.stripNamespace(acc);
        Assert.areEqual('Test', result.get('Name'));
        
        List<Map<String, Object>> listResult = NamespaceUtils.stripNamespaceList(new List<Account>{acc});
        Assert.areEqual(1, listResult.size());
        Assert.areEqual('Test', listResult[0].get('Name'));
    }
}