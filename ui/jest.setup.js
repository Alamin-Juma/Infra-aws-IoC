import { TextEncoder, TextDecoder } from 'text-encoding';
import '@testing-library/jest-dom';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
