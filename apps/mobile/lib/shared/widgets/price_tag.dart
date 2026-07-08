import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/text_styles.dart';

class PriceTag extends StatelessWidget {
  final double price;
  final bool small;
  const PriceTag({super.key, required this.price, this.small = false});

  @override
  Widget build(BuildContext context) {
    final style = small ? AppTextStyles.priceSmall : AppTextStyles.price;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('KES ', style: style.copyWith(fontSize: style.fontSize! * 0.65)),
        Text(price.toStringAsFixed(0), style: style),
        if (price != price.roundToDouble())
          Text('.${price.toStringAsFixed(2).split('.').last}',
              style: style.copyWith(fontSize: style.fontSize! * 0.7)),
      ],
    );
  }
}
