// tslint:disable: no-string-literal
import { RunTestCommand } from '../run-test';

describe('run-test', () => {
  describe('getAppBaseURL', () => {
    test('should default to datadog us', async () => {
      process.env = { };
      const command = new RunTestCommand();

      expect(command['getAppBaseURL']()).toBe('https://app.datadoghq.com/');
    });

    test('subdomain should be overridable', async () => {
      process.env = { DATADOG_SUBDOMAIN: 'custom' };
      const command = new RunTestCommand();

      expect(command['getAppBaseURL']()).toBe('https://custom.datadoghq.com/');
    });

    test('should override subdomain and site', async () => {
      process.env = { DATADOG_SITE: 'datadoghq.eu', DATADOG_SUBDOMAIN: 'custom' };
      const command = new RunTestCommand();

      expect(command['getAppBaseURL']()).toBe('https://custom.datadoghq.eu/');
    });
  });

  describe('getDatadogHost', () => {
    test('should default to datadog us api', async () => {
      process.env = { };
      const command = new RunTestCommand();

      expect(command['getDatadogHost']()).toBe('https://api.datadoghq.com/api/v1/');
      expect(command['getDatadogHost'](true)).toBe('https://intake.synthetics.datadoghq.com/api/v1/');
    });

    test('should be tunable through DATADOG_SITE variable', async () => {
      process.env = { DATADOG_SITE: 'datadoghq.eu' };
      const command = new RunTestCommand();

      expect(command['getDatadogHost']()).toBe('https://api.datadoghq.eu/api/v1/');
      expect(command['getDatadogHost'](true)).toBe('https://api.datadoghq.eu/api/v1/');
    });
  });
});
