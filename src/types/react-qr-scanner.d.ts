declare module 'react-qr-scanner' {
  import { Component } from 'react';

  interface QrScannerProps {
    onScan: (data: any) => void;
    onError: (err: any) => void;
    style?: object;
    constraints?: {
      video: {
        facingMode: string;
      };
    };
  }

  export default class QrScanner extends Component<QrScannerProps> {}
} 