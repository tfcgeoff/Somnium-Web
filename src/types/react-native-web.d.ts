/**
 * React Native Web Type Extensions
 *
 * Extends React Native's ViewStyle, TextStyle, and ImageStyle interfaces
 * to include web-specific CSS properties.
 *
 * @platform web
 */

import 'react-native';

declare module 'react-native' {
  interface ViewStyle {
    /**
     * Web-specific CSS transition property.
     * @platform web
     */
    transition?: string;

    /**
     * Web-specific CSS cursor property.
     * @platform web
     */
    cursor?: string;

    /**
     * Web-specific CSS user-select property.
     * @platform web
     */
    userSelect?: 'auto' | 'text' | 'none' | 'contain' | 'all';

    /**
     * Web-specific CSS outline property.
     * @platform web
     */
    outline?: string;
  }

  interface TextStyle {
    /**
     * Web-specific CSS transition property for text elements.
     * @platform web
     */
    transition?: string;
  }

  interface ImageStyle {
    /**
     * Web-specific CSS transition property for images.
     * @platform web
     */
    transition?: string;
  }
}
