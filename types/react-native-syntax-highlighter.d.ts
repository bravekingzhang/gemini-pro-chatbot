declare module 'react-native-syntax-highlighter' {
  import { StyleProp, ViewStyle } from 'react-native';

  interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    customStyle?: StyleProp<ViewStyle>;
    highlighter?: string;
    children: string;
  }

  export default function SyntaxHighlighter(props: SyntaxHighlighterProps): JSX.Element;
}

declare module 'react-syntax-highlighter/dist/cjs/styles/hljs' {
  const vs2015: any;
  export { vs2015 };
}