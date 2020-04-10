import {
  AxiosError,
  AxiosPromise,
  AxiosRequestConfig,
  default as axios,
} from 'axios';

import {
  APIConstructor,
  Payload,
  PollResult,
  Test,
  Trigger,
} from './interfaces';

interface BackendError {
  errors: string[];
}

export const formatBackendErrors = (requestError: AxiosError<BackendError>) => {
  if (requestError.response && requestError.response.data.errors) {
    const errors = requestError.response.data.errors.map((message: string) => `  - ${message}`);
    const serverHead = `query on ${requestError.config.baseURL}${requestError.config.url} returned:`;

    return `${serverHead}\n${errors.join('\n')}`;
  }

  return requestError.name;
};

const triggerTests = (request: (args: AxiosRequestConfig) => AxiosPromise<Trigger>) =>
  async (tests: Payload[]) => {
    const resp = await request({
      data: { tests },
      method: 'POST',
      url: '/synthetics/tests/trigger/ci',
    });

    return resp.data;
  };

const getTest = (request: (args: AxiosRequestConfig) => AxiosPromise<Test>) => async (testId: string) => {
  const resp = await request({
    url: `/synthetics/tests/${testId}`,
  });

  return resp.data;
};

const pollResults = (request: (args: AxiosRequestConfig) => AxiosPromise<{ results: PollResult[] }>) =>
  async (resultIds: string[]) => {
    const resp = await request({
      params: {
        result_ids: JSON.stringify(resultIds),
      },
      url: '/synthetics/tests/poll_results',
    });

    return resp.data;
  };

export const apiConstructor: APIConstructor = ({ appKey, apiKey, baseUrl, baseIntakeUrl }) => {
  const overrideArgs = (args: AxiosRequestConfig) => ({
    ...args,
    params: {
      api_key: apiKey,
      application_key: appKey,
      ...args.params,
    },
  });
  const request = (args: AxiosRequestConfig) => axios.create({ baseURL: baseUrl })(overrideArgs(args));
  const requestTrigger = (args: AxiosRequestConfig) => axios.create({ baseURL: baseIntakeUrl })(overrideArgs(args));

  return {
    getTest: getTest(request),
    pollResults: pollResults(request),
    triggerTests: triggerTests(requestTrigger),
  };
};