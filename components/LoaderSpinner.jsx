import { Blocks } from "react-loader-spinner";

export function LoaderSpinner({id}) {
    return (
        <div className='bsafesImageSpinner' style={{position:'absolute', textAlign:'center'}}>
            <Blocks
                id={id}
                visible={true}
                height="80"
                width="80"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                
            />
        </div>
    )
}