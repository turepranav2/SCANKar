declare module '@react-native-community/slider' {
    import { Component } from 'react';
    import { ViewProps } from 'react-native';
    export interface SliderProps extends ViewProps {
        value?: number;
        minimumValue?: number;
        maximumValue?: number;
        onValueChange?: (value: number) => void;
        minimumTrackTintColor?: string;
        maximumTrackTintColor?: string;
        thumbTintColor?: string;
    }
    export default class Slider extends Component<SliderProps> { }
}
