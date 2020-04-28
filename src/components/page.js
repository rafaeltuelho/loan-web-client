import "@patternfly/react-core/dist/styles/base.css";
import './fonts.css';

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownSeparator,
  Gallery,
  GalleryItem,
  KebabToggle,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  Page,
  PageHeader,
  PageSection,
  PageSectionVariants,
  PageSidebar,
  SkipToContent,
  TextContent,
  Text,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
// make sure you've installed @patternfly/patternfly
import AppForm from './form'
import AppHeader from "./header";

class AppPagelayout extends React.Component {
  state = {
    isDropdownOpen: false,
    isKebabDropdownOpen: false,
    activeGroup: 'grp-1',
    activeItem: 'grp-1_itm-1'
  };

  onNavSelect = result => {
    this.setState({
      activeItem: result.itemId,
      activeGroup: result.groupId
    });
  };

  handleItemOnclick = (event, itemId, groupId) => {
    console.log(`my own click handler on ${itemId}`);
  };

  render() {
    const { activeItem, activeGroup } = this.state;

    const PageNav = (
      <Nav onSelect={this.onNavSelect} aria-label="Nav" theme="dark">
        <NavList>
          <NavExpandable title="Loan Application" groupId="grp-1" isActive={activeGroup === 'grp-1'} isExpanded>
            <NavItem groupId="grp-1" itemId="grp-1_itm-1" 
              isActive={activeItem === 'grp-1_itm-1'}
              onClick={this.handleItemOnclick}
              >
              Apply
            </NavItem>
            <NavItem groupId="grp-1" itemId="grp-1_itm-2" 
              isActive={activeItem === 'grp-1_itm-2'}
              onClick={this.handleItemOnclick}
              >
              Signed
            </NavItem>
          </NavExpandable>
        </NavList>
      </Nav>
    );

    const Sidebar = <PageSidebar nav={PageNav} theme="dark" />;
    const pageId = 'main-content-page-layout-expandable-nav';

    return (
      <Page
        header={<AppHeader />}
        sidebar={Sidebar}
        isManagedSidebar
        mainContainerId={pageId}
      >
        <PageSection variant={PageSectionVariants.light}>
          <TextContent>
            <Text component="h1">Loan Application</Text>
            <Text component="p">
              Body text should be Overpass Regular at 16px. It should have leading of 24px because <br />
              of it’s relative line height of 1.5.
            </Text>
          </TextContent>
        </PageSection>
        <PageSection variant={PageSectionVariants.light}>
          <AppForm />
        </PageSection>
      </Page>
    );
  }
}

export default AppPagelayout;