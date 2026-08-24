import { Form, Head } from '@inertiajs/react';
import GoogleAuthButton, { GOOGLE_AUTH_ENABLED } from '@/components/google-auth-button';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { terms } from '@/routes/pages';
import { store } from '@/routes/register';
import type { TeamInvitationContext } from '@/types';

type Props = {
    passwordRules: string;
    teamInvitation?: TeamInvitationContext | null;
};

export default function Register({ passwordRules, teamInvitation }: Props) {
    return (
        <>
            <Head title="Sign Up" />
            <Form
                {...store.form()}
                transform={(data) => ({
                    ...data,
                    name: `${data.first_name} ${data.last_name}`.trim(),
                })}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {teamInvitation && (
                            <TeamInvitationAlert
                                invitation={teamInvitation}
                                action="Register"
                            />
                        )}

                        <div className="grid gap-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">
                                        First Name
                                    </Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="given-name"
                                        name="first_name"
                                        placeholder="Ex: Jhone"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        tabIndex={2}
                                        autoComplete="family-name"
                                        name="last_name"
                                        placeholder="Ex: Doe"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        tabIndex={3}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="Enter email address"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone_number">
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone_number"
                                        type="text"
                                        tabIndex={4}
                                        autoComplete="tel"
                                        name="phone_number"
                                        placeholder="01XXXXXXXXX"
                                    />
                                    <InputError message={errors.phone_number} />
                                </div>
                            </div>
                            <p className="-mt-4 text-xs text-muted-foreground">
                                Provide at least one of email or phone number.
                            </p>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={5}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Minimum 8 characters long"
                                        passwordrules={passwordRules}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm password
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={6}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Minimum 8 characters long"
                                        passwordrules={passwordRules}
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Checkbox
                                    id="terms"
                                    name="terms"
                                    required
                                    tabIndex={7}
                                    className="mt-0.5"
                                />
                                <Label
                                    htmlFor="terms"
                                    className="text-sm font-normal text-muted-foreground"
                                >
                                    I agree to the{' '}
                                    <TextLink href={terms()}>
                                        Terms and conditions
                                    </TextLink>
                                </Label>
                            </div>
                            <InputError message={errors.terms} />

                            <Button
                                type="submit"
                                className="w-full"
                                tabIndex={8}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Sign up
                            </Button>

                            {GOOGLE_AUTH_ENABLED && (
                                <div className="relative text-center text-sm">
                                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                    <div className="absolute inset-x-0 top-1/2 -z-0 border-t border-border" />
                                </div>
                            )}

                            <GoogleAuthButton />
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have account?{' '}
                            <TextLink
                                href={
                                    teamInvitation
                                        ? login.url({
                                              query: {
                                                  invitation:
                                                      teamInvitation.code,
                                              },
                                          })
                                        : login()
                                }
                                data-test="team-invitation-login-link"
                                tabIndex={9}
                            >
                                Sign in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Sign up',
    description: 'Enter your details below to create your account',
};
