import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'

/**
 * Subscribes to a Firestore query/collection reference. Pass `null` to skip.
 * `key` should change whenever the query changes (queries aren't comparable).
 */
export function useCollection(queryRef, key) {
  const [state, setState] = useState({ data: [], loading: true, error: null })

  useEffect(() => {
    if (!queryRef) {
      setState({ data: [], loading: false, error: null })
      return
    }
    setState((s) => ({ ...s, loading: true }))
    return onSnapshot(
      queryRef,
      (snap) =>
        setState({
          data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
          loading: false,
          error: null,
        }),
      (error) => {
        console.error(error)
        setState({ data: [], loading: false, error })
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
