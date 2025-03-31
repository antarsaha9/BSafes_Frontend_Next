import MainLayout from "../beautico/layout/MainLayout"

export default function StoreLayout({children}) {
    return (
        <MainLayout>
            {children}
        </MainLayout>
    )
}