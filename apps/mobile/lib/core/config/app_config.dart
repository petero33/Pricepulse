class AppConfig {
  static const String appName = 'PricePulse Kenya';
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000/api',
  );
  static const Duration cacheDuration = Duration(minutes: 30);
  static const int defaultPageSize = 20;
  static const double defaultMaxDistanceKm = 15;
}
