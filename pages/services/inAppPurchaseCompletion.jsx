
import { useRouter } from 'next/router';

import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'

import ContentPageLayout from '../../components/layouts/contentPageLayout';

export default function InAppPurchaseCompletion() {
    const router = useRouter();

    return (
        <ContentPageLayout>
            <Container>
                <div>
                    <div className='text-center'>
                        <img src='/images/thank_196.png' />
                    </div>
                    <h1 className="text-center">Thank you!</h1>
                    <h3 className="text-center">Payment succeeded.</h3>
                    <div className='text-center'>
                        <Button onClick={() => { router.push('/safe') }}>Done</Button>
                    </div>
                </div>
            </Container>
        </ContentPageLayout>
    )
}