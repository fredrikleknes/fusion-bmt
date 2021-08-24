import { ApolloError, gql, useMutation } from '@apollo/client'
import { TextArea } from '@equinor/fusion-components'
import { useEffect, useState } from 'react'
import { apiErrorMessage } from '../../../api/error'
import { Evaluation } from '../../../api/models'
import { useEffectNotOnMount } from '../../../utils/hooks'
import { SavingState } from '../../../utils/Variables'
import WorkshopSummary from './WorkshopSummary'


const WRITE_DELAY_MS = 1000

interface WorkshopSummaryWithApiProps {
    evaluation: Evaluation
}

const WorkshopSummaryWithApi = ({
    evaluation
}: React.PropsWithChildren<WorkshopSummaryWithApiProps>) => {
    const [localSummary, setLocalSummary] = useState(evaluation.summary ?? '')
    const [savingState, setSavingState] = useState(SavingState.None)
    const { setSummary, loading, error } = useSummaryMutation()

    const onChange = (value: string) => {
        setSavingState(SavingState.Saving)
        setLocalSummary(value)
    }

    useEffect(() => {
        if (loading) {
            setSavingState(SavingState.Saving)
        } else {
            if (savingState === SavingState.Saving) {
                setSavingState(SavingState.Saved)
            } else {
                setSavingState(SavingState.None)
            }
        }
    }, [loading])

    useEffectNotOnMount(() => {
        const timeout = setTimeout(() => {
            setSummary(evaluation.id, localSummary)
        }, WRITE_DELAY_MS)
        return () => {
            clearTimeout(timeout)
        }
    }, [localSummary])

    if (error !== undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not save summary')} onChange={() => {}} />
            </div>
        )
    }

    return (
        <>
            <WorkshopSummary
                localSummary={localSummary}
                onChange={onChange}
                savingState={savingState}
            />
        </>
    )
}

export default WorkshopSummaryWithApi

interface SetSummaryMutationProps {
    setSummary: (evaluationId: string, summary: string) => void
    loading: boolean
    error: ApolloError | undefined
}

const useSummaryMutation = (): SetSummaryMutationProps => {
    const SET_SUMMARY = gql`
        mutation SetSummary($evaluationId: String, $summary: String) {
            setSummary(evaluationId: $evaluationId, summary: $summary) {
                id
                summary
            }
        }
    `

    const [setSummaryApollo, { loading, error }] = useMutation(SET_SUMMARY)
    const setSummary = (evaluationId: string, summary: string) => {
        setSummaryApollo({
            variables: {
                evaluationId: evaluationId,
                summary: summary,
            },
        })
    }

    return {
        setSummary: setSummary,
        loading,
        error,
    }
}