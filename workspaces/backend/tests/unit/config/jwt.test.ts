import jwt from 'jsonwebtoken';
import * as jwtConfig from '../../../source/config/jwt';
import { JwtPayload } from '../../../source/config/jwt';

// Mock the jwt functions
jest.mock('../../../source/config/jwt', () => {
  const originalModule = jest.requireActual('../../../source/config/jwt');
  return {
    ...originalModule,
    generateToken: jest.fn(),
    verifyToken: jest.fn()
  };
});

describe('JWT Configuration', () => {
  const mockPayload: JwtPayload = {
    id: 1,
    login: 'teste@exemplo.com'
  };

  const mockToken = 'mocked.jwt.token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should call generateToken with correct parameters', () => {
      // Arrange
      (jwtConfig.generateToken as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = jwtConfig.generateToken(mockPayload);

      // Assert
      expect(jwtConfig.generateToken).toHaveBeenCalledWith(mockPayload);
      expect(result).toBe(mockToken);
    });

    it('should return the token from generateToken', () => {
      // Arrange
      (jwtConfig.generateToken as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = jwtConfig.generateToken(mockPayload);

      // Assert
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('should call verifyToken with correct parameters', () => {
      // Arrange
      (jwtConfig.verifyToken as jest.Mock).mockReturnValue(mockPayload);

      // Act
      const result = jwtConfig.verifyToken(mockToken);

      // Assert
      expect(jwtConfig.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(mockPayload);
    });

    it('should return the decoded payload when token is valid', () => {
      // Arrange
      (jwtConfig.verifyToken as jest.Mock).mockReturnValue(mockPayload);

      // Act
      const result = jwtConfig.verifyToken(mockToken);

      // Assert
      expect(result).toEqual(mockPayload);
    });

    it('should return null when token verification fails', () => {
      // Arrange
      (jwtConfig.verifyToken as jest.Mock).mockReturnValue(null);

      // Act
      const result = jwtConfig.verifyToken(mockToken);

      // Assert
      expect(jwtConfig.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(result).toBeNull();
    });

    it('should return null when token is expired', () => {
      // Arrange
      (jwtConfig.verifyToken as jest.Mock).mockReturnValue(null);

      // Act
      const result = jwtConfig.verifyToken(mockToken);

      // Assert
      expect(result).toBeNull();
    });
  });
});
