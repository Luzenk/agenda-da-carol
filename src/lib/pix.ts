// PIX EMV QR Code Generator with CRC16-CCITT

interface PixData {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txId?: string;
  description?: string;
}

// CRC16-CCITT calculation
function crc16(str: string): string {
  let crc = 0xFFFF;
  
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  
  crc = crc & 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generateEMVField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

export function generatePixPayload(data: PixData): string {
  // Payload Format Indicator
  let payload = generateEMVField('00', '01');
  
  // Merchant Account Information
  let merchantAccount = '';
  merchantAccount += generateEMVField('00', 'br.gov.bcb.pix'); // GUI
  merchantAccount += generateEMVField('01', data.pixKey); // PIX Key
  
  if (data.description) {
    merchantAccount += generateEMVField('02', data.description);
  }
  
  payload += generateEMVField('26', merchantAccount);
  
  // Merchant Category Code
  payload += generateEMVField('52', '0000');
  
  // Transaction Currency (986 = BRL)
  payload += generateEMVField('53', '986');
  
  // Transaction Amount (if provided)
  if (data.amount && data.amount > 0) {
    payload += generateEMVField('54', data.amount.toFixed(2));
  }
  
  // Country Code
  payload += generateEMVField('58', 'BR');
  
  // Merchant Name
  payload += generateEMVField('59', data.merchantName.substring(0, 25));
  
  // Merchant City
  payload += generateEMVField('60', data.merchantCity.substring(0, 15));
  
  // Additional Data Field (txId)
  if (data.txId) {
    const additionalData = generateEMVField('05', data.txId.substring(0, 25));
    payload += generateEMVField('62', additionalData);
  }
  
  // CRC16 placeholder
  payload += '6304';
  
  // Calculate and append CRC16
  const crcValue = crc16(payload);
  payload += crcValue;
  
  return payload;
}

export function formatPixValue(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

// Generate QR Code using qrcode library
export async function generatePixQRCode(payload: string): Promise<string> {
  const QRCode = require('qrcode');
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}
