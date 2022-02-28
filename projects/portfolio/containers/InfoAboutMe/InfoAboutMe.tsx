import React from 'react'

import { makeCn } from '@shared/utils'
import { AboutMe, MyProjects } from './components'
const cn = makeCn('InfoAboutMe', styles)
import styles from './InfoAboutMe.module.scss'


export const InfoAboutMe: React.FC = () => {

  return (
    <div className={cn()}>
      <AboutMe />
      <MyProjects />
    </div>
  )
}
