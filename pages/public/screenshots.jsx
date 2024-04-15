import { useState } from 'react'
import { useRouter } from "next/router";
import Link from 'next/link';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';

import { Montserrat } from 'next/font/google'

import BSafesStyle from '../../styles/BSafes.module.css'

import ContentPageLayout from '../../components/layouts/contentPageLayout';
import Footer from '../../components/footer';


export const monteserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
})


export default function Screeshots() {
    const router = useRouter();

    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [imageInModal, setImageInModal] = useState('');

    const handleUnlock = () => {
        router.push("/logIn");
    }

    const imageClicked = (e) => {
        setShowModal(true);
        setModalTitle(e.target.title);
        setImageInModal(e.target.src);
    }

    return (
        < ContentPageLayout publicPage={true} publicHooks={{ onOpen: handleUnlock }
        } showNavbarMenu={false} showPathRow={false} >
            <div style={{ backgroundColor: '#d5e9f3', color: 'black' }}>
                <Container className={monteserrat.className}>
                    <br />
                    <Row className={BSafesStyle.descriptionRow}>
                        <Col xs={12} sm={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                            <h1 className='display-1 text-center'>Screenshots</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col className='text-center'>
                            <span style={{ color: 'gray' }}>Destop</span> <Link href='/public/screenshotsMobile'>Mobile</Link>
                        </Col>
                    </Row>
                    <Row>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Own Your BSafes' variant="top" src="/images/ownYourBSafes.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Own Your BSafes</Card.Title>
                                    <Card.Text>
                                        Give your BSafes a Nickname and Key Password, and then you will own it.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Open Your BSafes' variant="top" src="/images/openYourBSafes.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Open Your BSafes</Card.Title>
                                    <Card.Text>
                                        Enter the Nickname and Key Password, and then you will open it.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Add an Item' variant="top" src="/images/itemTypes.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Add an Item</Card.Title>
                                    <Card.Text>
                                        You can add Pages, Notebooks, Diaries, Folders, and Boxes.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Rich Text Editor' variant="top" src="/images/richTextEditor.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Rich Text Editor</Card.Title>
                                    <Card.Text>
                                        A secure rich-text editor allows you to write and add videos and images.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Uploading a Video' variant="top" src="/images/uploadingAVideo.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Uploading a Video</Card.Title>
                                    <Card.Text>
                                        You can upload and embed videos in the editor.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Uploading an Image' variant="top" src="/images/uploadingAnImage.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Uploading an Image</Card.Title>
                                    <Card.Text>
                                        You can upload and embed images in the editor.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Search' variant="top" src="/images/search.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Search</Card.Title>
                                    <Card.Text>
                                        You can search for items by titles or tags.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Notebook' variant="top" src="/images/notebook.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Notebook</Card.Title>
                                    <Card.Text>
                                        A Notebook contains pages sorted by page numbers.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Notebook Pages' variant="top" src="/images/notebookPage.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Notebook Pages</Card.Title>
                                    <Card.Text>
                                        You can turn to a specific page by number.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Diary' variant="top" src="/images/diary.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Diary</Card.Title>
                                    <Card.Text>
                                        A Diary contains pages sorted by dates.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Diary Pages' variant="top" src="/images/diaryPages.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Diary Pages</Card.Title>
                                    <Card.Text>
                                        You can turn to a specific page by date.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Box' variant="top" src="/images/box.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Box</Card.Title>
                                    <Card.Text>
                                        You can add and organize any item in a box.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Folder' variant="top" src="/images/folder.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Folder</Card.Title>
                                    <Card.Text>
                                        You can add and organize any page in a box.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className='my-2 d-flex justify-content-center' xs={12} sm={6} lg={4}>
                            <Card style={{ width: '32rem' }}>
                                <Card.Img title='Workspace' variant="top" src="/images/workspace.png" onClick={imageClicked} />
                                <Card.Body>
                                    <Card.Title>Workspace</Card.Title>
                                    <Card.Text>
                                        You can have different workspaces for different purposes.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
            <Footer />
            <br />
            <Modal show={showModal} fullscreen={true} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <img className='mx-auto d-block img-fluid' src={imageInModal} />
                </Modal.Body>
            </Modal>

        </ContentPageLayout >
    )
}