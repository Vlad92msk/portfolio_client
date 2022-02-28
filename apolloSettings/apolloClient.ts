import { useMemo } from 'react'
import { ApolloClient, DataProxy, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { concatPagination } from '@apollo/client/utilities'
import merge from 'deepmerge'
import isEqual from 'lodash/isEqual'
import { getCookie, storageGet, storageRemove } from '@shared/utils'
import { CookieEnum } from '@public/models/cookie'
import { LocalStorageEnum } from '@public/models/localStorage'

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

let apolloClient: ApolloClient<NormalizedCacheObject>


const createApolloClient = (userLanguage: string) => new ApolloClient({
  ssrMode: typeof window === 'undefined',
  link: new HttpLink({
    headers: { userLanguage },
    uri: `http://${process.env.CLIENT_HOST}:${process.env.SERVER_PORT}/graphql/`
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          allPosts: concatPagination()
        }
      }
    }
  })
})


export const initializeApollo = (lang: string, initialState = null) => {
  // @ts-ignore
  const prevStateLang = apolloClient && apolloClient.link.options?.headers.userLanguage
  /**
   * Если клиент есть и его язык равен тому, что выбрал пользователь - запускаем его
   * если нет - создаем новый клиент с актуальным языком
   */
  const _apolloClient = (Boolean(apolloClient) && prevStateLang === lang) ? apolloClient : createApolloClient(lang)
  // const _apolloClient = createApolloClient(lang)

  // Если уже есть данные
  if (initialState) {
    // Получить существующий кеш, загруженный во время выборки данных на стороне клиента
    const existingCache = _apolloClient.extract()

    // Объединить существующий кеш с данными, переданными из getStaticProps / getServerSideProps
    const data = merge(initialState, existingCache, {
      // объединять массивы, используя равенство объектов (как в наборах)
      arrayMerge: (destinationArray, sourceArray) => [...sourceArray, ...destinationArray.filter((d) => sourceArray.every((s) => !isEqual(d, s)))]
    })

    // Восстановить кеш с объединенными данными
    _apolloClient.cache.restore(data)
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient

  // Чистит localStorage если пользователь вышел/не авторизирован
  if (!getCookie(CookieEnum.TOKEN)) storageRemove(LocalStorageEnum.USER)


  // Для SSG и SSR всегда создавайте нового клиента Apollo.
  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

type Pops = {
  props: {
    [key: string]: any
  }
}
export const addApolloState = (client: ApolloClient<NormalizedCacheObject>, pageProps: Pops) => {
  pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract()
  return pageProps
}

export const useApollo = (lang: string, pageProps: unknown): ApolloClient<NormalizedCacheObject> => {
  const state = pageProps[APOLLO_STATE_PROP_NAME]
  return useMemo(() => initializeApollo(lang, state), [state, lang])
}
export type ApolloStateType = ReturnType<typeof useApollo>

/**
 * @description Получить данные из кэша
 * @param options
 */
export const getCache = (options: DataProxy.ReadQueryOptions<NormalizedCacheObject, unknown>): NormalizedCacheObject => {
  const language: string = storageGet('userLanguage')
  const apolloClient = initializeApollo(language)
  return apolloClient.cache.readQuery(options)
}
