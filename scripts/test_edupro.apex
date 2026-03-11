Map<String, Object> metrics = EduProDashboardController.getDashboardMetrics();
System.debug('Total Students: ' + metrics.get('totalStudents'));
System.debug('Total Revenue: ' + metrics.get('totalRevenue'));
System.debug('Recent Admissions: ' + metrics.get('recentAdmissions'));
System.debug('Payment Overview: ' + metrics.get('paymentOverview'));
