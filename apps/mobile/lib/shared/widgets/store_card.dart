import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/text_styles.dart';
import '../../core/utils/helpers.dart';

class StoreResultCard extends StatelessWidget {
  final String storeName;
  final String branchName;
  final String? storeColor;
  final double? totalCost;
  final int availableItems;
  final int totalItems;
  final double? distance;
  final bool isBest;
  final VoidCallback onTap;

  const StoreResultCard({
    super.key,
    required this.storeName,
    required this.branchName,
    this.storeColor,
    required this.totalCost,
    required this.availableItems,
    required this.totalItems,
    this.distance,
    this.isBest = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = storeColor != null ? Color(int.parse(storeColor!.replaceFirst('#', '0xFF'))) : AppColors.primary;
    final availability = availableItems / totalItems;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(
                    storeName[0].toUpperCase(),
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: color,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(storeName, style: AppTextStyles.titleLarge),
                    const SizedBox(height: 2),
                    Text(branchName, style: AppTextStyles.bodyMedium),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        _buildAvailabilityBadge(availability, color),
                        if (distance != null) ...[
                          const SizedBox(width: 8),
                          Icon(Icons.location_on_outlined,
                              size: 14, color: AppColors.textHint),
                          const SizedBox(width: 2),
                          Text(formatDistance(distance),
                              style: AppTextStyles.bodySmall),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (totalCost != null)
                    Text(formatPrice(totalCost!), style: AppTextStyles.priceSmall)
                  else
                    Text('N/A', style: AppTextStyles.bodySmall),
                  const SizedBox(height: 4),
                  Text('$availableItems/$totalItems items',
                      style: AppTextStyles.bodySmall),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvailabilityBadge(double ratio, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: ratio >= 0.8
            ? AppColors.success.withValues(alpha: 0.1)
            : AppColors.warning.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        '${(ratio * 100).round()}%',
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: ratio >= 0.8 ? AppColors.success : AppColors.warning,
        ),
      ),
    );
  }
}
