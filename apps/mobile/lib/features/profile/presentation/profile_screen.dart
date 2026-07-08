import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../auth/data/auth_repository.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authRepo = AuthRepository();
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const CircleAvatar(
            radius: 40,
            backgroundColor: AppColors.primary,
            child: Text('U', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: Colors.white)),
          ),
          const SizedBox(height: 16),
          Text('User', style: AppTextStyles.headlineMedium, textAlign: TextAlign.center),
          const SizedBox(height: 4),
          Text('PricePulse Contributor', style: AppTextStyles.bodyMedium, textAlign: TextAlign.center),
          const Divider(height: 32),
          _MenuItem(icon: Icons.stars, title: 'Rewards & Points', onTap: () {}),
          _MenuItem(icon: Icons.notifications_outlined, title: 'Notification Settings', onTap: () {}),
          _MenuItem(icon: Icons.location_on_outlined, title: 'Nearby Stores', onTap: () {}),
          _MenuItem(icon: Icons.info_outline, title: 'About', onTap: () {}),
          const Divider(height: 32),
          ListTile(
            leading: const Icon(Icons.logout, color: AppColors.error),
            title: const Text('Logout', style: TextStyle(color: AppColors.error)),
            onTap: () async {
              await authRepo.logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.textPrimary),
      title: Text(title, style: AppTextStyles.titleMedium),
      trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
      onTap: onTap,
    );
  }
}
