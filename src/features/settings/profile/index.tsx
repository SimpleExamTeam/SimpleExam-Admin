import ContentSection from '../components/content-section'
import ProfileForm from './profile-form'

export default function SettingsProfile() {
  return (
    <ContentSection
      title='个人资料'
      desc='这是您在系统中展示的个人信息。'
    >
      <ProfileForm />
    </ContentSection>
  )
}
