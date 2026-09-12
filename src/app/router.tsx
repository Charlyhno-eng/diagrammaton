import { Route, Routes } from 'react-router-dom'
import { EditorPage } from '../features/diagram/ui/EditorPage'

export function AppRouter() { return <Routes><Route path="*" element={<EditorPage />} /></Routes> }
