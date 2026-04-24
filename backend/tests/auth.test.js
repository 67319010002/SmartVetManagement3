import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// ============================================================
// UNIT TESTS: Auth & Access Control Logic
// ============================================================

const TEST_SECRET = 'test-secret-key';

// --- Pure auth validation logic ---
function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

function checkRole(userRole, allowedRoles) {
  return allowedRoles.includes(userRole);
}

// --- Simulated middleware logic ---
function authMiddlewareLogic(authHeader, secret) {
  if (!authHeader) return { error: 'No token, authorization denied', status: 401 };
  const token = authHeader.split(' ')[1];
  if (!token) return { error: 'Token format invalid', status: 401 };
  const decoded = verifyToken(token, secret);
  if (!decoded) return { error: 'Token is not valid', status: 401 };
  return { user: decoded, status: 200 };
}

// ============================================================
// 1. JWT Token Tests
// ============================================================
describe('JWT Token Validation', () => {
  it('✅ สร้างและยืนยัน Token ได้ถูกต้อง', () => {
    const payload = { id: 1, role: 'OWNER', email: 'owner@test.com' };
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' });
    const decoded = verifyToken(token, TEST_SECRET);
    expect(decoded).not.toBeNull();
    expect(decoded.id).toBe(1);
    expect(decoded.role).toBe('OWNER');
  });

  it('❌ Token ที่ถูกแก้ไขควรถูกปฏิเสธ', () => {
    const token = jwt.sign({ id: 1 }, TEST_SECRET);
    const tamperedToken = token + 'tampered';
    const decoded = verifyToken(tamperedToken, TEST_SECRET);
    expect(decoded).toBeNull();
  });

  it('❌ Token ที่หมดอายุแล้วควรถูกปฏิเสธ', () => {
    const token = jwt.sign({ id: 1 }, TEST_SECRET, { expiresIn: '0s' });
    // รอให้ Token หมดอายุ
    const decoded = verifyToken(token, TEST_SECRET);
    expect(decoded).toBeNull();
  });

  it('❌ Token ที่ใช้ Secret ผิดควรถูกปฏิเสธ', () => {
    const token = jwt.sign({ id: 1 }, 'wrong-secret');
    const decoded = verifyToken(token, TEST_SECRET);
    expect(decoded).toBeNull();
  });
});

// ============================================================
// 2. Auth Middleware Logic Tests
// ============================================================
describe('Auth Middleware Logic', () => {
  let validToken;

  beforeEach(() => {
    validToken = jwt.sign({ id: 5, role: 'VET' }, TEST_SECRET, { expiresIn: '1h' });
  });

  it('✅ ผ่าน Auth: ส่ง Token ที่ถูกต้อง', () => {
    const result = authMiddlewareLogic(`Bearer ${validToken}`, TEST_SECRET);
    expect(result.status).toBe(200);
    expect(result.user.id).toBe(5);
  });

  it('❌ ปฏิเสธ: ไม่มี Authorization Header', () => {
    const result = authMiddlewareLogic(null, TEST_SECRET);
    expect(result.status).toBe(401);
    expect(result.error).toContain('No token');
  });

  it('❌ ปฏิเสธ: ส่ง Token ที่ไม่ถูกต้อง', () => {
    const result = authMiddlewareLogic('Bearer invalid.token.here', TEST_SECRET);
    expect(result.status).toBe(401);
    expect(result.error).toContain('not valid');
  });
});

// ============================================================
// 3. Role-Based Access Control Tests
// ============================================================
describe('Role-Based Access Control (RBAC)', () => {
  it('✅ VET เข้าถึงได้: Route ที่อนุญาตทั้ง VET และ OWNER', () => {
    expect(checkRole('VET', ['VET', 'OWNER'])).toBe(true);
  });

  it('✅ OWNER เข้าถึงได้: Route ที่อนุญาต OWNER', () => {
    expect(checkRole('OWNER', ['OWNER'])).toBe(true);
  });

  it('❌ OWNER เข้าถึงไม่ได้: Route ที่จำกัดเฉพาะ VET', () => {
    expect(checkRole('OWNER', ['VET'])).toBe(false);
  });

  it('❌ VET เข้าถึงไม่ได้: Route ที่จำกัดเฉพาะ OWNER', () => {
    expect(checkRole('VET', ['OWNER'])).toBe(false);
  });

  it('✅ ตรวจสอบ Role จาก Token ที่ decode แล้ว', () => {
    const vetToken = jwt.sign({ id: 3, role: 'VET' }, TEST_SECRET);
    const decoded = verifyToken(vetToken, TEST_SECRET);
    expect(checkRole(decoded.role, ['VET'])).toBe(true);
    expect(checkRole(decoded.role, ['OWNER'])).toBe(false);
  });
});
