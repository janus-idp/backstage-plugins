import React from 'react';

import { kialiStyle } from '../../styles/StyleUtils';

const iconStyle = kialiStyle({
  height: '1.5rem',
});

const GraphqlIcon = require('../../assets/img/api/graphql.svg') as string;
const GrpcIcon = require('../../assets/img/api/grpc.svg') as string;
const RestIcon = require('../../assets/img/api/rest.svg') as string;
const GoLogo = require('../../assets/img/runtime/go.svg') as string;
const JVMLogo = require('../../assets/img/runtime/java.svg') as string;
const MicroProfileLogo =
  require('../../assets/img/runtime/microprofile.svg') as string;
const NodejsLogo = require('../../assets/img/runtime/nodejs.svg') as string;
const QuarkusLogo = require('../../assets/img/runtime/quarkus.svg') as string;
const SpringBootLogo =
  require('../../assets/img/runtime/spring-boot.svg') as string;
const ThorntailLogo =
  require('../../assets/img/runtime/thorntail.svg') as string;
const TomcatLogo = require('../../assets/img/runtime/tomcat.svg') as string;
const VertxLogo = require('../../assets/img/runtime/vertx.svg') as string;

const renderLogo = (
  name: string,
  title: string | undefined,
  idx: number,
  logoSet: { [key: string]: any },
  className?: string,
): React.ReactElement => {
  const logo = logoSet[name];

  if (logo) {
    return (
      <img
        key={`logo-${idx}`}
        src={logo}
        alt={name}
        title={title}
        className={className}
      />
    );
  }

  return <span key={`logo-${idx}`}>{name}</span>;
};

// API types
const apiLogos = {
  grpc: GrpcIcon,
  rest: RestIcon,
  graphql: GraphqlIcon,
};

const runtimesLogos = {
  Go: GoLogo,
  JVM: JVMLogo,
  MicroProfile: MicroProfileLogo,
  'Node.js': NodejsLogo,
  Quarkus: QuarkusLogo,
  'Spring Boot': SpringBootLogo,
  Thorntail: ThorntailLogo,
  Tomcat: TomcatLogo,
  'Vert.x': VertxLogo,
};

export const renderRuntimeLogo = (name: string, idx: number): React.ReactNode =>
  renderLogo(name, name, idx, runtimesLogos, iconStyle);

export const renderAPILogo = (
  name: string,
  title: string | undefined,
  idx: number,
): React.ReactNode => renderLogo(name, title, idx, apiLogos, iconStyle);
