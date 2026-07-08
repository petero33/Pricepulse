import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/otp_verify_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/products/presentation/product_detail_screen.dart';
import '../../features/products/presentation/search_screen.dart';
import '../../features/shopping/presentation/basket_screen.dart';
import '../../features/shopping/presentation/comparison_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';

final _storage = const FlutterSecureStorage();

final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  redirect: (context, state) async {
    final token = await _storage.read(key: 'access_token');
    final isAuthRoute = state.matchedLocation.startsWith('/login');

    if (token == null && !isAuthRoute) return '/login';
    if (token != null && isAuthRoute) return '/';
    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (_, __) => const LoginScreen(),
    ),
    GoRoute(
      path: '/verify-otp',
      builder: (_, state) => OtpVerifyScreen(
        phone: state.extra as String,
      ),
    ),
    GoRoute(
      path: '/',
      builder: (_, __) => const HomeScreen(),
    ),
    GoRoute(
      path: '/search',
      builder: (_, __) => const SearchScreen(),
    ),
    GoRoute(
      path: '/products/:id',
      builder: (_, state) => ProductDetailScreen(
        productId: state.pathParameters['id']!,
      ),
    ),
    GoRoute(
      path: '/basket',
      builder: (_, __) => const BasketScreen(),
    ),
    GoRoute(
      path: '/basket/compare',
      builder: (_, __) => const ComparisonScreen(),
    ),
    GoRoute(
      path: '/profile',
      builder: (_, __) => const ProfileScreen(),
    ),
  ],
);
