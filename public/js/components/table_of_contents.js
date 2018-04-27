import React, {
Component,
} from 'react';


export class TableOfContents extends Component {


  constructor(props) {
    super(props);
  }


  render() {
    return (
    <div>Here be my layers...</div>
    );
  }


}

// {/*<EuiPageSideBar>*/}
// {/*<EuiSideNav*/}
// {/*mobileTitle="Navigate within $APP_NAME"*/}
// {/*toggleOpenOnMobile={this.toggleOpenOnMobile}*/}
// {/*isOpenOnMobile={this.state.isSideNavOpenOnMobile}*/}
// {/*items={sideNav}*/}
// {/*/>*/}
// {/*</EuiPageSideBar>*/}


// const sideNav = [
//   this.createItem('Elastic Map Service', {
//     icon: <EuiIcon type="logoElastic" />,
//     items: [
//       this.createItem('Vector layers', {
//         items: [
//           this.createItem('U.S. cities'),
//           this.createItem('U.S. states'),
//           this.createItem('World countries'),
//         ]
//       }),
//     ],
//   })
// ];