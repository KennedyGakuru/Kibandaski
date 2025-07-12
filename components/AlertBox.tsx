import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AlertType = 'success' | 'error' | 'warning' | 'info';

type AlertBoxProps = {
  type: AlertType;
  message: string;
  onClose?: () => void;
};

const bgColors: Record<AlertType, string> = {
  success: 'bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-700 text-green-900 dark:text-green-100',
  error: 'bg-red-100 dark:bg-red-900 border-red-500 dark:border-red-700 text-red-900 dark:text-red-100',
  warning: 'bg-yellow-100 dark:bg-yellow-900 border-yellow-500 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100',
  info: 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-700 text-blue-900 dark:text-blue-100',
};

const icons: Record<AlertType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'warning',
  info: 'information-circle',
};

export default function AlertBox({ type, message, onClose }: AlertBoxProps) {
  return (
    <View
      role="alert"
      className={`border-l-4 p-3 rounded-lg flex-row items-center justify-between ${bgColors[type]}`}
    >
      <View className="flex-row items-center flex-1">
        <Ionicons name={icons[type]} size={20} className="mr-2" />
        <Text className="text-xs font-semibold text-black dark:text-white flex-shrink">
          {message}
        </Text>
      </View>

      {onClose && (
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={18} color="gray" />
        </TouchableOpacity>
      )}
    </View>
  );
}
